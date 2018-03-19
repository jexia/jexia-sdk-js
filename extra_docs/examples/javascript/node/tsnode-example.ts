
// Node application
import { dataOperations, jexiaClient } from "jexia-sdk-js/node";

// Initialize DataOperationsModule
let dom = dataOperations();
// Initialize Client and pass DataOperationsModule to it.
jexiaClient().init({
  projectID: "anemo002",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret",
}, dom);
// Use your data module
dom.dataset("posts")
  .select()
  .where((field) => field("title").isEqualTo("My first post"))
  .execute()
  .then((records) => {
    console.log(records);
    process.exit();
  })
  .catch((error) => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });
