
// Node application
import { dataOperations, jexiaClient, realTime } from "jexia-sdk-js/node";

// Optionally use interfaces to type your datasets,
// then you will have better auto complete and type cheeking
interface Post {
  title: string;
  published: boolean;
}

// Initialize DataOperationsModule
const dataModule = dataOperations();

// Initialize Client and pass the data operations and real time modules to it.
jexiaClient().init({
  projectID: "anemo002",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret",
}, dataModule, realTime());

// Use your data module with an optional generic type
dataModule.dataset<Post>("posts")
  // Chose the events you wanna watch
  .watch("created", "deleted")
  .subscribe(
    (messageObject) => {
      console.log("Realtime message received:", messageObject.data.title);
    },
    (error) => {
      // there was an error somewhere
      console.log(error);
      process.exit();
    },
  );
