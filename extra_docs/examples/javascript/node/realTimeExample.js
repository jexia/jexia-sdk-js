
const jexiaSDK = require('jexia-sdk-js/node');
const fetch = require('node-fetch');
const ws = require("ws");

const dataOperations = jexiaSDK.dataOperations;
const field = jexiaSDK.field;
const jexiaClient = jexiaSDK.jexiaClient;
const realTime = jexiaSDK.realTime;

let dom = dataOperations();
let rtc = realTime((messageObject) => {
  console.log("Realtime message received:");
  console.log(messageObject);
}, (url) => {
    return new ws(url, {origin: "http://localhost"});
});
let jexiaClientInstance = jexiaClient(fetch);

jexiaClientInstance.init({projectID: "anemo002", key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", secret: "a_secret"}, dom, rtc).then( () => {
  return rtc.subscribe("insert", dom.dataset("keywords")).then( () => {
    console.log("Succesfully subscribed to dataset changes");
    return dom.dataset("keywords").insert([{keyword: "aNewKeyword"}, {keyword: "anotherKeyword"}]).execute();
  }).then( (records) => {
    console.log("HTTP response to request query received, shutting down in 5, 4, 3...");
    setTimeout( () => {
      jexiaClientInstance.terminate().then( () => process.exit() );
    }, 5000);
  });
}).catch( (err) => {
  console.log(err.message);
  jexiaClientInstance.terminate().then( () => process.exit() );
});
