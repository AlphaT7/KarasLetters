module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{html,js,css,json,png,jpg,mp3,ico}"],
  swDest: "dist/sw.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "app-name-cache",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 5,
        },
      },
    },
  ],
};
