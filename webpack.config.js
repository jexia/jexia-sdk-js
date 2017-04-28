const path = require('path');

// common SDK config
const common = {
  entry: {
    "jexia-sdk": path.resolve(__dirname, 'src','index')
  },
  module: {
    rules: [
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
  }
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
