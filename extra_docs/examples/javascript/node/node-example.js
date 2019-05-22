
const { dataOperations, jexiaClient } = require("jexia-sdk-js/node");

const dataSetName = "dataset";

//Initialize DataOperationsModule
const dataModule = dataOperations();
const credentials = {
  projectID: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret"
};

//Initialize Client and pass DataOperationsModule to it.
jexiaClient().init(credentials, dataModule);

dataModule.dataset(dataSetName)
  .insert([
    { "field": "Some value" },
    { "field": "Some value again" },
  ])
  .execute()
  .then((records) => {
    console.log("Records are inserted:\n=======================\n", records);
    process.exit();
  }).catch((error) => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });

