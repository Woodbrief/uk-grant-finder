/**
 * UK Property Grant Finder — widget.js
 *
 * Auto-resizing iframe embed script.
 * Usage: add <div id="grant-finder"></div> to your page, then load this script.
 *
 * Replace GRANT_FINDER_URL with the URL of your deployed GitHub Pages site.
 *
 *   <div id="grant-finder"></div>
 *   <script src="https://your-username.github.io/uk-grant-finder/embed/widget.js"></script>
 *
 * To customise the target element ID, set window.GRANT_FINDER_TARGET before loading the script:
 *   <script>window.GRANT_FINDER_TARGET = 'my-custom-div-id';</script>
 */

(function () {
  'use strict';

  // ── Configuration ────────────────────────────────────────────
  var GRANT_FINDER_URL = (function () {
    // Infer base URL from this script's src attribute
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      if (src && src.indexOf('widget.js') !== -1) {
        // Strip /embed/widget.js to get the root
        return src.replace(/\/embed\/widget\.js.*$/, '/');
      }
    }
    // Fallback — update this to your deployed URL
    return 'https://your-username.github.io/uk-grant-finder/';
  })();

  var TARGET_ID = (typeof window.GRANT_FINDER_TARGET === 'string')
    ? window.GRANT_FINDER_TARGET
    : 'grant-finder';

  var INITIAL_HEIGHT = 700;

  // ── Inject iframe ────────────────────────────────────────────
  function init() {
    var container = document.getElementById(TARGET_ID);
    if (!container) {
      console.warn('[Grant Finder widget] No element with id="' + TARGET_ID + '" found.');
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.id = 'grant-finder-iframe';
    iframe.src = GRANT_FINDER_URL;
    iframe.width = '100%';
    iframe.height = INITIAL_HEIGHT;
    iframe.frameBorder = '0';
    iframe.title = 'UK Property Grant Finder';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', '');
    iframe.style.cssText = [
      'border: none',
      'border-radius: 12px',
      'display: block',
      'width: 100%',
      'transition: height 0.3s ease',
    ].join('; ') + ';';

    container.appendChild(iframe);

    // ── Auto-resize via postMessage ──────────────────────────
    window.addEventListener('message', function (event) {
      // Only handle messages from our iframe origin
      try {
        var iframeOrigin = new URL(iframe.src).origin;
        if (event.origin !== iframeOrigin && event.origin !== 'null') return;
      } catch (e) {
        // If URL parsing fails, allow through (e.g. file:// during dev)
      }

      if (event.data && event.data.type === 'gf-resize') {
        var newHeight = parseInt(event.data.height, 10);
        if (!isNaN(newHeight) && newHeight > 0) {
          iframe.style.height = (newHeight + 32) + 'px';
        }
      }
    });
  }

  // ── Wait for DOM ready ───────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
