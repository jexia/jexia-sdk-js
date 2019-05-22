
// Node application
import { dataOperations, jexiaClient } from "jexia-sdk-js/node";

// Optionally use interfaces to type your datasets,
// then you will have better auto complete and type cheeking
interface Post {
  title: string;
  published: boolean;
}

// Initialize DataOperationsModule
const dataModule = dataOperations();
// Initialize Client and pass DataOperationsModule to it.
jexiaClient().init({
  projectID: "anemo002",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret",
}, dataModule);

// Use your data module with an optional generic type
dataModule.dataset<Post>("posts")
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
