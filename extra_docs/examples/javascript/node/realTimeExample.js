
const { dataOperations, realTime, jexiaClient } = require("jexia-sdk-js/node");

// Initialize DataOperationsModule
const dataModule = dataOperations();

// Initialize Client and pass the data operations and real time modules to it.
jexiaClient().init({
  projectID: "anemo002",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret",
}, dataModule, realTime());

// Use your data module
dataModule.dataset("posts")
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
