const jexiaSDK = require('jexia-sdk-js/node');
const fetch = require('node-fetch');

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;
const field = jexiaSDK.field;

//Initialize DataOperationsModule
let dataModule = dataOperations();
//Initialize Client and pass DataOperationsModule to it.
let client = jexiaClient(fetch).init({projectID: "localhost", key: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", secret: "a_secret"}, dataModule);
//select Posts
function selectPosts(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//sort records
function sortRecords(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().sortDesc("id").execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//limit records
function limitRecords(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().limit(2).execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//offset records
function offsetRecords(jexiaClient){
      jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().offset(1).execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//offset and limit records
function offsetLimitRecords(jexiaClient){
      jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().limit(2).offset(1).execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//filter records
function filterRecords(jexiaClient){
      jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.select().where(field("title").isEqualTo("My second post")).execute().then( (records) => {
            console.log(records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//retrieve relations
function retrieveRelation(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        let commentsDataset = dataModule.dataset("comments")
        postDataset.select().relation(commentsDataset).execute().then( (records) => {
            let data = records;
            for(let i=0; i < data.length; i++){
                console.log("ID "+ data[i].id)
                console.log("USERID" + data[i].user_id)
                console.log("CATEGORYID " + data[i].category_id)
                console.log("TITLE " + data[i].title)
                console.log("POST " + data[i].post)
                console.log("POSTED "+ data[i].posted)
                //now you can access the comments field from the dataset comments
                let comments = data[i].comments
                for(let i=0; i < comments.length; i++){
                    console.log("COMMENTID " + comments[i].id)
                    console.log("USERID " + comments[i].user_id)
                    console.log("POSTID " + comments[i].post_id)
                    console.log("COMMENT " + comments[i].comment)
                }
            }
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//insert records
function insertRecord(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.insert([{user_id: "81729942-329c-41f4-89d3-b2604ec63ff7", title: "Super awesome post", post:"super awesome content"}]).execute().then( (records) => {
            console.log("New Record" + records);
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
//delete records
function deleteRecord(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.delete().where(field("title").isEqualTo("My second post")).execute().then( (records) => {
            console.log("Record " + JSON.stringify(records)) ;
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
function updateRecord(jexiaClient){
    jexiaClient.then( (initializedClient) => {
        let postDataset = dataModule.dataset("posts");
        postDataset.update({title: "New Posttttt"}).where(field("title").isEqualTo("New Post")).execute().then( (records) => {
            console.log("Record " + JSON.stringify(records)) ;
            process.exit();
        }).catch( (error) => {
            // there was a problem retrieving the records
            console.log(error);
            process.exit();
        });
    });
}
updateRecord(client)
//selectPosts(client)
//sortRecords(client)
//limitRecords(client);
//offsetRecords(client);
//offsetLimitRecords(client);
//filterRecords(client);
//retrieveRelation(client);
//insertRecord(client);
//deleteRecord(client)
