(function () {
  'use strict';

  // =========================================================================
  // CONFIGURATION: TARGET URL SELECTION
  // =========================================================================
  const CONFIG = {
    USE_ENCODED_URL: false,
    DIRECT_URL: 'https://cdn.jsdelivr.net/gh/sethabout3653-sketch/bestgameseverforever@main/index.html',
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
  // 1. TAB SPINNER FORCE-LOADER (UNCLOSED STREAM TECHNIQUE)
  // Forces Chrome/Edge to display the tab loading spinner permanently.
  // =========================================================================
  const forcePersistentTabSpinner = () => {
    // Method 1: Create a invisible iframe loading a non-resolving data stream
    const dummyFrame = document.createElement('iframe');
    dummyFrame.style.display = 'none';
    dummyFrame.style.width = '0px';
    dummyFrame.style.height = '0px';
    dummyFrame.style.border = 'none';

    // Point to a data stream that never fires a load/close event
    dummyFrame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html>
        <head></head>
        <body>
          <script>
            // Unending synchronous block / infinite pending connection
            window.stop = function(){};
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/#never_resolve_' + Math.random(), true);
            xhr.send();
            
            // Re-trigger loop if network ever resets
            setInterval(function() {
              var img = new Image();
              img.src = '/#pending_' + Date.now();
            }, 1000);
          <\/script>
        </body>
      </html>
    `);

    document.body.appendChild(dummyFrame);

    // Method 2: Continually open write streams to keep window pending
    try {
      const hiddenDoc = dummyFrame.contentWindow.document;
      hiddenDoc.open();
      hiddenDoc.write('<html><body><!-- Pending load stream -->');
      // Intentionally DO NOT call hiddenDoc.close()
    } catch (e) {}
  };

  // =========================================================================
  // 2. SCRAPER & BOT DETECTOR
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
  // 5. MAIN EMBEDDED IFRAME CONSTRUCTOR
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

    // Render the visible embed iframe
    const frame = buildSecureFrame();
    document.body.appendChild(frame);
    attachTamperObserver(frame);

    // Trigger unclosed background stream to lock tab spinner
    forcePersistentTabSpinner();
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
