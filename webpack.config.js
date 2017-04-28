const ugly = require('webpack-uglify-js-plugin');
const path = require('path');

// common SDK config
const common = {
  entry: {
    "jexia-sdk": path.resolve(__dirname, 'src','index'),
    "jexia-sdk.min": path.resolve(__dirname, 'src','index')
  },
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
    extensions: [".ts", ".js"]
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
    })
  ]
};

// browser SDK config
const browser = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "browser-[name].js",
    libraryTarget: 'umd',
    library: "jexia"
  }
};

// node SDK config
const node = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "node-[name].js",
    libraryTarget: 'commonjs'
  },
  target: 'node'
};

module.exports = [
  Object.assign({}, common, browser),
  Object.assign({}, common, node)
];
