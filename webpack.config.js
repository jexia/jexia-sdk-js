const path = require('path');

// common SDK config
const common = {
  // TODO: set valid entry point
  entry: './src/index',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
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
    filename: "jexia-browser-sdk.js"
  },
};

// node SDK config
const node = {
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "jexia-node-sdk.js"
  },
  target: 'node',
};

module.exports = [
  Object.assign({} , common, browser),
  Object.assign({} , common, node)
];
