/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-1b9fa687'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "assets/fonts/HerrVonMuellerhoff-Regular.ttf",
    "revision": "127eeb3fb5f6a35b05734d4335672b90"
  }, {
    "url": "assets/images/about.txt",
    "revision": "e05172abf25a4c8046c57e72d5903bbf"
  }, {
    "url": "assets/images/android-chrome-192x192.png",
    "revision": "79b395cb813f3c335aa08fbac8cdcc8c"
  }, {
    "url": "assets/images/android-chrome-512x512.png",
    "revision": "2e8b59f0f95540df1b07489cc15e8976"
  }, {
    "url": "assets/images/apple-touch-icon.png",
    "revision": "84cc81b5ad1fa58baae99f1a0ee14a29"
  }, {
    "url": "assets/images/favicon-16x16.png",
    "revision": "8239b565021918b90061c8aba6dbc3d0"
  }, {
    "url": "assets/images/favicon-32x32.png",
    "revision": "7f1562f66e1ea3a7cc8a68f3a0f5b237"
  }, {
    "url": "assets/images/favicon.ico",
    "revision": "2ddfc783f5f1d180a2ba27f9569833ef"
  }, {
    "url": "assets/images/site.webmanifest",
    "revision": "053100cb84a50d2ae7f5492f7dd7f25e"
  }, {
    "url": "assets/json/lowerCaseCursive.json",
    "revision": "63ae7894070d2089c052799ee1e88f8a"
  }, {
    "url": "assets/json/lowerCaseLetters.json",
    "revision": "22550888a3c096617dd45068416e2157"
  }, {
    "url": "assets/json/numbers.json",
    "revision": "25440f5d7f10e7cad4d258248a796c07"
  }, {
    "url": "assets/json/upperCaseCursive.json",
    "revision": "ae7d9bb68956b8ccb4a83394a4a7756e"
  }, {
    "url": "assets/json/upperCaseLetters.json",
    "revision": "bc4edff8f4db128e6227cc786568d082"
  }, {
    "url": "assets/style.css",
    "revision": "fa02b60c5b752b242ea265133bb24d0e"
  }, {
    "url": "index.html",
    "revision": "4e98095993fa855948f64cdf4a159346"
  }, {
    "url": "main.bundle.js",
    "revision": "cd2831793c90a3923e140bc906e594a9"
  }], {});
  workbox.registerRoute(({
    url
  }) => url.origin === "https://api.example.com", new workbox.NetworkFirst({
    "cacheName": "WW-AppCache",
    "networkTimeoutSeconds": 4,
    plugins: []
  }), 'GET');

}));
//# sourceMappingURL=service-worker.js.map
