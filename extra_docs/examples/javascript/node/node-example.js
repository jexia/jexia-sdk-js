
const jexiaSDK = require('../../../../dist/node');

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;
const dataSetName = "dataset";

//Initialize DataOperationsModule
let dom = dataOperations();
let credentials = {
  projectID: "3d53988c-3544-4d27-9782-f05e73e5581b",
  key: "b9bccc78-8376-4050-a2c1-e814c0d6af4c",
  secret: "eY0BAYcUPqCZKRzRCan9CSwA4y45/PtWis6YaSKjSaMVzxwO0fjw2kn9uDfYuQBNtXspBJT2YKw9sMCgCHpm7Q=="
};

//Initialize Client and pass DataOperationsModule to it.
jexiaClient().init(credentials, dom);

  dom.dataset(dataSetName)
    .insert({ "field": "Some value" })
    .execute()
    .then((records) => {
      console.log("Records are inserted:\n=======================\n", records);
      process.exit();
    }).catch((error) => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });

