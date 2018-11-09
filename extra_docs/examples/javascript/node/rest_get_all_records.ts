// tslint:disable:no-console
// tslint:disable:interface-name
// Node application
import { dataOperations, jexiaClient } from "jexia-sdk-js/node";

// Optionally use interfaces to type your datasets,
// then you will have better auto complete and type cheeking
interface Post {
  title: string;
  published: boolean;
}

// Initialize DataOperationsModule
let dom = dataOperations();

// Initialize Client and pass DataOperationsModule to it.
jexiaClient().init({
  projectID: "_projectId_",
  key: "_key_",
  secret: "_secret_"
}, dom);

// Use your data module with an optional generic type
dom.dataset<Post>("posts")
  .select()
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
