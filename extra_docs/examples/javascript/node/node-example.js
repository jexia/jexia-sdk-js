
const jexiaSDK = require('../../../../dist/node');

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;
const dataSetName = "dataset";

//Initialize DataOperationsModule
let dom = dataOperations();
let credentials = {
  projectID: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret"
};

//Initialize Client and pass DataOperationsModule to it.
jexiaClient().init(credentials, dom);

  dom.dataset(dataSetName)
    .insert([{ "field": "Some value" },{ "field": "Some value again" }])
    .execute()
    .then((records) => {
      console.log("Records are inserted:\n=======================\n", records);
      process.exit();
    }).catch((error) => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });

