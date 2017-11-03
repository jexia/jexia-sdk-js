jexiaClient = require("../../../../dist/node-jexia-sdk.min.js").jexiaClient;
dataOperations = require("../../../../dist/node-jexia-sdk.min.js").dataOperations;
fetch = require("node-fetch");
field = require("../../../../dist/node-jexia-sdk.min.js").field;

//Initialize DataOperationsModule
let dom = dataOperations();
//Initialize Client and pass DataOperationsModule to it.
jexiaClient(fetch).init({appUrl: "localhost", key: "anna@example.com", secret: "annie123"}, dom).then( (initializedClient) => {
  dom.dataset("posts").select().filter(field("title").isEqualTo("My first post")).execute().then( (records) => {
    console.log(records);
    process.exit();
  }).catch( (error) => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });
});
