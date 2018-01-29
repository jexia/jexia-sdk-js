
// Node application
import { dataOperations, field, jexiaClient } from "jexia-sdk-js/node";

// You will need to add a compatible dependency to your project. For development of the SDK we've used node-fetch
import nodeFetch from "node-fetch";

// Initialize DataOperationsModule
let dom = dataOperations();
// Initialize Client and pass DataOperationsModule to it.
jexiaClient(nodeFetch).init({
  projectID: "anemo002",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret",
}, dom)
.then((initializedClient) => {
  dom.dataset("posts").select().where(field("title").isEqualTo("My first post")).execute().then((records) => {
    console.log(records);
    process.exit();
  }).catch((error) => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });
});
