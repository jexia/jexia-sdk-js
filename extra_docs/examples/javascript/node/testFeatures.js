const { jexiaClient, dataOperations } = require('jexia-sdk-js/node');

//Initialize DataOperationsModule
const dataModule = dataOperations();

//Initialize Client and pass DataOperationsModule to it.
const credentials = {
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
};

jexiaClient().init(credentials, dataModule);

//select Posts
function selectPosts(){
  dataModule.dataset("posts")
    .select()
    .execute()
    .then(records => {
      console.log(records);
      process.exit();
    })
    .catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//sort records
function sortRecords(){
  dataModule.dataset("posts")
    .select()
    .sortDesc("id")
    .execute().then(records => {
      console.log(records);
      process.exit();
    }).catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//limit records
function limitRecords(){
  dataModule.dataset("posts")
    .select()
    .limit(2)
    .execute()
    .then(records => {
      console.log(records);
      process.exit();
    })
    .catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//offset records
function offsetRecords(){
  dataModule.dataset("posts")
    .select()
    .offset(1)
    .execute()
    .then(records => {
      console.log(records);
      process.exit();
    })
    .catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//offset and limit records
function offsetLimitRecords(){
  dataModule.dataset("posts")
  .select()
  .limit(2)
  .offset(1)
  .execute()
  .then(records => {
    console.log(records);
    process.exit();
  })
  .catch(error => {
    // there was a problem retrieving the records
    console.log(error);
    process.exit();
  });
}
//filter records
function filterRecords(){
  dataModule.dataset("posts")
    .select()
    .where(field => field("title").isEqualTo("My second post"))
    .execute()
    .then(records => {
      console.log(records);
      process.exit();
    })
    .catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//retrieve relations
function retrieveRelation(){
  dataModule.dataset("posts")
  commentsDataset = dataModule.dataset("comments")
  postDataset.select()
    .relation(commentsDataset).execute().then((data) => {
      for(let item of data){
        console.log("ID "+ item.id)
        console.log("USERID" + item.user_id)
        console.log("CATEGORYID " + item.category_id)
        console.log("TITLE " + item.title)
        console.log("POST " + item.post)
        console.log("POSTED "+ item.posted)
        //now you can access the comments field from the dataset comments
        for (let comment of item.comments){
          console.log("COMMENTID " + comment.id)
          console.log("USERID " + comment.user_id)
          console.log("POSTID " + comment.post_id)
          console.log("COMMENT " + comment.comment)
        }
      }
      process.exit();
    }).catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//insert records
function insertRecord(){
  dataModule.dataset("posts")
    .insert([{user_id: "81729942-329c-41f4-89d3-b2604ec63ff7", title: "Super awesome post", post:"super awesome content"}])
    .execute()
    .then(records => {
      console.log("New Record" + records);
      process.exit();
    }).catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
//delete records
function deleteRecord(){
  dataModule.dataset("posts")
    .delete()
    .where(field => field("title").isEqualTo("My second post"))
    .execute()
    .then(records => {
      console.log("Record " + JSON.stringify(records)) ;
      process.exit();
    }).catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
function updateRecord(){
  dataModule.dataset("posts")
    .update({title: "New Posttttt"})
    .where(field => field("title").isEqualTo("New Post"))
    .execute()
    .then(records => {
      console.log("Record " + JSON.stringify(records)) ;
      process.exit();
    })
    .catch(error => {
      // there was a problem retrieving the records
      console.log(error);
      process.exit();
    });
}
updateRecord()
//selectPosts()
//sortRecords()
//limitRecords();
//offsetRecords();
//offsetLimitRecords();
//filterRecords();
//retrieveRelation();
//insertRecord();
//deleteRecord()
