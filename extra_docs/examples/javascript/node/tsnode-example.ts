
// Node application
import { dataOperations, field, jexiaClient } from "jexia-sdk-js/node";

// Initialize DataOperationsModule
let dom = dataOperations();
// Initialize Client and pass DataOperationsModule to it.
jexiaClient().init({
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
