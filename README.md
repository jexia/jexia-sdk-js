# Jexia Javascript SDK

[![CircleCI](https://circleci.com/gh/jexia/jexia-sdk-js.svg?style=svg)](https://circleci.com/gh/jexia/jexia-sdk-js)
[![Chat on Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?sanitize=true)](https://chat.jexia.com)

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
  .subscribe(
    records => console.log("All the records:", records),
    error => console.error("Something wrong happened:", error)
  );
```

### Documentation

Check out [documentation](https://docs.jexia.com/) on the official Jexia website.

### Contributing

You can find all the steps at the [Contributing Guide](https://github.com/jexia/jexia-sdk-js/blob/master/CONTRIBUTING.md).

## License

[MIT](https://github.com/jexia/jexia-sdk-js/blob/master/LICENSE)
