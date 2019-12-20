const TerserPlugin = require('terser-webpack-plugin');
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
    new TerserPlugin({
      extractComments: true,
    }),
  ],
  mode: "production"
};

module.exports = [
  common,
  minify,
];
