# Jexia Javascript SDK

[![CircleCI](https://circleci.com/gh/jexia/jexia-sdk-js.svg?style=svg)](https://circleci.com/gh/jexia/jexia-sdk-js)

This is the official JavaScript / TypeScript SDK for interacting with Jexia projects.

## Install

```bash
npm install jexia-sdk-js --save
```

## Example Use

```javascript
// Node application
const jexiaSDK = require('jexia-sdk-js/node');
const dataModule = jexiaSDK.dataOperations();

var credentials = {
  projectID: "test",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret"
};

jexiaSDK.jexiaClient().init(credentials, dataModule);
dataModule
  .dataset("posts")
  .select()
  .execute()
  .then(records => console.log("All the records:", records))
  .catch(error => console.error("Something wrong happened:", error));
```

## Developer Guide

### Getting Started

Check out the [Quick Start Guide](https://jexia.github.io/jexia-sdk-js/additional-documentation/quick-start-guide.html) for a quick guide on using the SDK in your application.

### Api Docs

Check out the [Api Docs](https://jexia.github.io/jexia-sdk-js/) for detailed view of the JavaScript SDK Api.

### Contributing

You can find all the steps at the [Contributing Guide](https://jexia.github.io/jexia-sdk-js/additional-documentation/code-of-conduct.html).

## License

[MIT](https://jexia.github.io/jexia-sdk-js/license.html)
