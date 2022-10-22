const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/assets/index.js",
  mode: "development",
  devtool: "inline-source-map",
  target: "web",
  stats: {
    children: true,
  },
  devServer: {
    static: ["src/assets"],
    compress: true,
    hot: false,
    host: "0.0.0.0",
    port: 3000,
  },
  watchOptions: {
    ignored: "/node_modules/",
    poll: 1000, // Check for changes every second
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Kara's Letters",
      template: "src/index.html",
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
