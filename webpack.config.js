const ugly = require('webpack-uglify-js-plugin');
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
  entry: {
    "jexia-sdk": path.resolve(__dirname, 'src','indexBrowser'),
    "jexia-sdk.min": path.resolve(__dirname, 'src','indexBrowser')
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "browser-[name].js",
    libraryTarget: 'umd',
    library: "jexia"
  }
};

// node SDK config
const node = {
  entry: {
    "jexia-sdk": path.resolve(__dirname, 'src','indexNode'),
    "jexia-sdk.min": path.resolve(__dirname, 'src','indexNode')
  },
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
