Client = require("../../../dist/node-jexia-sdk.min.js").Client;
DataOperationsModule = require("../../../dist/node-jexia-sdk.min.js").DataOperationsModule;
fetch = require("node-fetch");
//Initialize DataOperationsModule
let dom = new DataOperationsModule()
//Initialize Client and pass DataOperationsModule to it.
new Client(fetch).init({appUrl: "localhost", key: "anna@example.com", secret: "annie123"}, dom).then( (initializedClient) => {
  dom.dataset("posts").select().execute().then( (records) => {
    console.log(records)
    // you can start iterating through the posts here
  }).catch( (error) => {
    // there was a problem retrieving the records
    console.log(error)
  });
});
