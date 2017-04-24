// common SDK config
const common = {
  // TODO: set valid entry point
  entry: './src/index',
  output: {
    path: __dirname + "/dist",
    filename: "anemo-sdk.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};

// browser SDK config
const browser = {
  output: {
    path: __dirname + "/dist",
    filename: "browser-sdk.js"
  },
};

// node SDK config
const node = {
  output: {
    path: __dirname + "/dist",
    filename: "node-sdk.js"
  },
  target: 'node',
};

module.exports = [
  Object.assign({} , common, browser),
  Object.assign({} , common, node)
];
