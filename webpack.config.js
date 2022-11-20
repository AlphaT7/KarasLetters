const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = {
  watch: false,
  entry: "./src/index.js",
  mode: "development",
  // mode: "production",
  devtool: "inline-source-map",
  target: "web",
  stats: {
    children: true,
  },
  stats: { warnings: false },
  devServer: {
    client: {
      overlay: false,
    },
    static: ["src/assets"],
    compress: true,
    hot: false,
    host: "0.0.0.0",
    port: 3000,
    liveReload: true,
  },
  // watchOptions: {
  // Check for changes every second
  // Only necessary if using a Docker container
  //   poll: 1000,
  // },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "public"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Kara's Letters",
      template: "src/index.html",
    }),
    new CopyPlugin({
      // this plugin copy's the asset folder to the production public folder
      patterns: [{ from: "./src/assets", to: "./assets/" }],
    }),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/audio/],
      maximumFileSizeToCacheInBytes: 5000000,
      runtimeCaching: [
        {
          //urlPattern: ({ url }) => url.origin === "https://karasletters-abb2b.web.app/",
          urlPattern: ({ url }) => url.origin === "http://localhost:3000/",
          handler: "NetworkFirst",
          options: {
            cacheName: "WW-AppCache",
            networkTimeoutSeconds: 4,
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ttf|ico|png|svg|webp|jpg|jpeg|json|txt|mp3|webmanifest)$/i,
        type: "asset/resource",
      },
    ],
  },
};
