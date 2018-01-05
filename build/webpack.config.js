const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const SRC_PATH = '../src';
const DIST_PATH = '../dist/bundle';

const common = {
  entry: {
    "browser": path.resolve(__dirname, SRC_PATH, 'browser'),
    "node": path.resolve(__dirname, SRC_PATH, 'node')
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
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
    filename: "[name].js",
    libraryTarget: 'umd',
    library: "jexia"
  }
};

const minify = {
  ...common,
  output: {
    ...common.output,
    filename: "[name].min.js",
  },
  plugins: [
    new UglifyJsPlugin(),
  ],
};

module.exports = [
  common,
  minify,
];
