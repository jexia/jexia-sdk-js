const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const SRC_PATH = "../src";
const DIST_PATH = "../dist/bundle";

const common = {
  entry: {
    "browser": path.resolve(__dirname, SRC_PATH, "browser")
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: "ts-loader",
        include: [
          path.resolve(__dirname, SRC_PATH)
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, DIST_PATH),
    filename: "[name].umd.js",
    libraryTarget: "umd",
    library: "jexia"
  },
  mode: "development"
};

const minify = {
  ...common,
  output: {
    ...common.output,
    filename: "[name].umd.min.js",
  },
  plugins: [
    new UglifyJsPlugin({
      extractComments: true,
    }),
  ],
  mode: "production"
};

module.exports = [
  common,
  minify,
];
