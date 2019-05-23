
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
const credentials = {
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
};

// Initialize Client and pass the data operations and real time modules to it.
jexiaClient().init(credentials, dataModule, realTime());

// Use your data module with an optional generic type
dataModule.dataset<Post>("posts")
  // Chose the events you want to watch
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
