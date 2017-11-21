# Jexia Javascript SDK
This is the official Javascript SDK for interacting with Jexia projects. It's developed with [TypeScript](https://typescript.org) and transpiled to ES5 with [Webpack](https://webpack.js.org/).

Check out the `Quick Start Guide` for a quick guide on using the SDK in your application.

Check out the `Code Contribution Guide` for a quick guide on using the development environment to contribute with code changes.

## Installation

### NPM

It can be easily installed by using npm as follows:

```bash
npm install jexia-sdk-js --save
```

## Quick Example

```javascript
// Node application
const jexiaSDK = require('jexia-sdk-js/node');
// You will need to add a compatible dependency to your project. For development of the SDK we've used node-fetch
const fetch = require('node-fetch');
const module = jexiaSDK.dataOperations();

var credentials = {
  projectID: "test",
  key: "anna@example.com",
  secret: "annie123"
};

jexiaSDK.jexiaClient(fetch).init(credentials, module).then(function() {
  module
    .dataset("posts")
    .select()
    .execute()
    .then(function(records) {
      console.log("All the records:", records);
    })
    .catch(function(error) {
      console.error("Something wrong happened:", error);
    });
}).catch(function(error) {
  console.error("Something wrong happened:", error);
});
```

## Development

### Requirements

* [node](https://nodejs.org/en/) >= 8.x
* [npm](https://www.npmjs.com/) >= 5.x
* A Jexia project in the cloud.

### Setting up the project

The project only requires installing node dependences:

```bash
npm install
```

**Transpiling the code**

In order to have the code transpiled.

```bash
npm run transpile
```

### Tests

Tests are written with [Jasmine](https://jasmine.github.io) in the `spec/` directory and coverage is measured by [istanbul](https://istanbul.js.org/).

```bash
npm run test
```
