# Jexia Javascript SDK

[![CircleCI](https://circleci.com/gh/jexia/jexia-sdk-js.svg?style=svg)](https://circleci.com/gh/jexia/jexia-sdk-js)

This is the official JavaScript / TypeScript SDK for interacting with Jexia projects.

## Install for NodeJs
With NodeJs you will need to install `node-fetch` and `ws` dependencies:

```bash
npm install jexia-sdk-js node-fetch ws --save
```

## Install for Web browser

```bash
npm install jexia-sdk-js --save
```


## Example Use

```javascript
const jexiaSDK = require("jexia-sdk-js/node"); // use require("jexia-sdk-js/browser") for browser
const dataModule = jexiaSDK.dataOperations();

const credentials = {
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
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
