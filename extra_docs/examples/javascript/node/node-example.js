
const jexiaSDK = require('jexia-sdk-js/node');
const fetch = require('node-fetch');

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;
const field = jexiaSDK.field;

//Initialize DataOperationsModule
let dom = dataOperations();
//Initialize Client and pass DataOperationsModule to it.
jexiaClient(fetch).init({projectID: "anemo002", key: "anna@example.com", secret: "annie123"}, dom).then( (initializedClient) => {
  dom.dataset("posts").select().where(field("title").isEqualTo("My first post")).execute().then( (records) => {
    console.log(records);
    process.exit();
  }).catch( (error) => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });
});
