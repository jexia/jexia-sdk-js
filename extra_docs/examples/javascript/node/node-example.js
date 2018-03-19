
const jexiaSDK = require('../../../../dist/node');

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;

//Initialize DataOperationsModule
let dom = dataOperations();
let credentials = {
  projectID: "test",
  key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  secret: "a_secret"
};
//Initialize Client and pass DataOperationsModule to it.
jexiaClient().init(credentials, dom);
setTimeout(() => {

  dom.dataset("posts")
    .select()
    .where(field => field("title").isEqualTo("My first post"))
    .execute()
    .then((records) => {
      console.log(records);
      process.exit();
    }).catch((error) => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}, 10)
