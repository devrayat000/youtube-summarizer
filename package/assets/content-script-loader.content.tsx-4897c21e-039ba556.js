(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/content.tsx-4897c21e.js")
    );
  })().catch(console.error);

})();
