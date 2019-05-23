
const { dataOperations, realTime, jexiaClient } = require("jexia-sdk-js/node");

// Initialize DataOperationsModule
const dataModule = dataOperations();
const credentials = {
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
};

// Initialize Client and pass the data operations and real time modules to it.
jexiaClient().init(credentials, dataModule, realTime());

// Use your data module
dataModule.dataset("posts")
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
