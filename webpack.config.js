const ugly = require('webpack-uglify-js-plugin');
const webpack = require('webpack');
const path = require('path');

// common SDK config
const common = {
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.ts$/,
        loader: "tslint-loader",
        include: [
          path.resolve(__dirname, "src")
        ],
        options: {
          failOnHint: false,
          typeCheck: false,
          emitErrors: false,
          fix: false
        }
      },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        include: [
          path.resolve(__dirname, "src")
        ]
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new ugly({
      cacheFolder: path.resolve(__dirname, 'dist'),
      debug: true,
      minimize: true,
      sourceMap: false,
      output: {
        comments: false
      },
      compressor: {
        warnings: false
      },
      include: /\.min\.js$/
    }),
    new webpack.NormalModuleReplacementPlugin(
      /src\/config\/config.ts/,
      './config.prod.ts'
    ),
  ]
};

// browser SDK config
const browser = {
  entry: {
    "browser": path.resolve(__dirname, 'src','indexBrowser'),
    "browser.min": path.resolve(__dirname, 'src','indexBrowser')
  },
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "[name].js",
    libraryTarget: 'umd',
    library: "jexia"
  }
};

// node SDK config
const node = {
  entry: {
    "node": path.resolve(__dirname, 'src','indexNode'),
    "node.min": path.resolve(__dirname, 'src','indexNode')
  },
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "[name].js",
    libraryTarget: 'commonjs'
  },
  target: 'node'
};

module.exports = [
  Object.assign({}, common, browser),
  Object.assign({}, common, node)
];
