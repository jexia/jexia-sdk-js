# Quick Start Guide for the Javascript Anemo SDK

The SDK currently exposes the following features:
  - on-demand access to data stored in DataSets (creating, reading, updating, deleting records)
  - real-time notifications for subscribed events
  - Authentication and authorization is handled automatically by the SDK, the user only needs to provide credentials once at SDK initialization.

The SDK is currently focused on *consuming* data. *Managing* the data schema (creating Datasets, adding columns to Datasets, etc.) is out of scope for now.

### On-demand data access
The user can execute the following operations on records:
  - create
  - read
  - update
  - delete

Executing an operation on a set of records is done through a Query. Depending on their type, Queries give the user access to some (or all) of the following options:
  - filtering (only records satisfying a certain condition will be retrieved/affected)
  - sorting (the records will be sorted by a rule and direction before the action is executed)
  - limiting/offsetting (only a certain number of records, starting from a certain position in the Dataset will be affected)
  - selecting the fields to be retrieved (when the user does not want the entire record to be retrieved, only certain columns)
  - relations (records from related datasets, as instructed, will also be affected by the request)

All these features are handled server-side. Right now there is no client-side functionality implemented for filtering, sorting, etc. 

### Real-time communication

The user can subscribe to events and will be notified in real time when those events are fired off on the server.
Right now the events are only related to actions made on data. Subscription works on a per-dataset (and schema), per-action level. For example: adding records to the Posts dataset, or deleting records in the Users dataset.

## Code samples

Please keep in mind that this quick start guide uses Javascript 2017 syntax.

The examples are made with a simple data schema in mind: think a basic social media platform where `users` can write `posts` and/or `comments` to `posts`. A `post` can be related to any number of `comments`, while each `post` and each `comment` has a `user` as author.

### Importing the SDK into your JS project

``` Javascript
import Client from "Anemo SDK location";
```

### Initialization and Authentication

The `Client` class expects to receive a `fetch` standard compliant library on initialization. On browser you can use the global `fetch` object. On node, you will need to add a compatible dependency to your project. For development of the SDK we've used `node-fetch` and can recommend it.

``` Javascript
import fetch from "node-fetch";

let initializedClientPromise = new Client(fetch).init({appUrl: "your Jexia App URL", key: "username", secret: "password"});
initializedClientPromise.then( (initializedClient) => {
  // you have been succesfully logged in!
  // you can start using the initializedClient variable to operate on records here
}).catch( (error) => {
  // uh-oh, there was a problem logging in, check the error.message for more info
});
```

### Dataset objects and Query objects

Using an initialized `Client` object, you can instantiate `Dataset` objects like so:

``` Javascript
let postsDataset = client.dataset("posts");
```

Using a `Datase` object, you can instantiate a `Query` object, depending on the type of query you want to execute

``` Javascript
let selectQuery = postsDataset.select();
let insertQuery = postsDataset.insert( [ post1, post2 ] );
let updateQuery = postsDataset.update( [ title: "Updated title" ] );
let deleteQuery = postsDataset.delete();
```

Any `Query` can be executed by calling `.execute()` on it. This results in a `Promise` resolving to a set of records, regardless of the type of `Query` executed. For select queries, the records returned are the records that the user wants to retrieve. For the other queries, the records returned are the actual records that have been operated on (modified, added or deleted).

Each different `Query` type has different support for the query options (filtering, sorting, etc.). E.g. you cannot apply filtering to insert queries, as the method isn't defined on the `InsertQuery` object.

### Our first query: selecting all records in a dataset

Using all the temporary variables in this example is for demonstration purposes, mostly to point out the different objects and functionality involved when working with records.

``` Javascript
new Client(fetch).init({appUrl: "your Jexia App URL", key: "username", secret: "password"}).then( (initializedClient) => {
  let postsDataset = initializedClient.dataset("posts");
  let unexecutedQuery = postsDataset.select();
  let executedQueryPromise = unexecutedQuery.execute();
  executedQueryPromise.then( (records) => {
    // you can start iterating through the posts here
  }).catch( (error) => {
    // there was a problem retrieving the records
  });
});
```

If you watch closely, the API is chainable, so you can rewrite the query in a much less verbose way:

``` Javascript
new Client(fetch).init({appUrl: "your Jexia App URL", key: "username", secret: "password"}).then( (initializedClient) => {
  initializedClient.dataset("posts").select().execute().then( (records) => {
    // you can start iterating through the posts here
  }).catch( (error) => {
    // there was a problem retrieving the records
  });
});
```

But at the very least, defining dataset variables could come in handy when executing multiple different queries on the same dataset.

### Sorting records

To activate sorting, you need to call `.sortAsc` or `.sortDesc` on a `Query` object and pass as string the name of the field you want to sort by.

``` Javascript
...
posts.select().sortAsc("id").execute().then( (records) => {
  // operate on your sorted records here
});
```

### Limit and offset

You can use `.limit` and `.offset` on a `Query` object for these options. They can be used separately or together. Only setting the limit (to a value X) will make the query operate on the first X records. Only setting the offset will make the query operate on the last Y records, starting from the offset value. 

``` Javascript
...
posts.select().limit(2).offset(5).execute().then( (records) => {
  // records will be an array of 2 records, starting from position 5 in the Dataset
});
```

### Only retrieving certain fields

You can use the `.fields` method to define what fields you want to retrieve.

``` Javascript
...
posts.select().fields("id", "title").execute().then( (records) => {
  // the individual record objects will only have the two properties defined above
});
```

### Filtering records

You can use the filtering feature to select what records a certain query will operate on.

In order to define a filter, you need to use the `FilterConditon` or `CompositeFilteringCondition` objects. They can be created using the exposed methods `condition` and `complexCondition`.

``` Javascript
import { condition, complexCondition } from "Anemo SDK location";

let simpleCondition = condition("field", "operator", "value");
let compositeCondition = simpleCondition.or("anotherField", "operator", "anotherValue");
let nestedCondition = complexCondition(compositeCondition).and("aThirdField", "operator", "value");
```

In order to use these conditions, they need to be added to a query using the `.filter` method

``` Javascript
...
posts.select().filter(condition("id", "=", "1"));
```

Multiple `.filter` calls can be chained, but only the last call will be taken into account. If a complex condition needs to be set for filtering, it has to be created in one go (in-line or not) and passed as an argument to the `.filter` method.

``` Javascript
...
let theCondition = complexCondition( condition("id",">","1").and("id","<", "9") ).
                    or("user_id", "=", "22");
dataset.select().filter(theCondition);
```
### Filtering operator list and examples

[Work in Progress]

### Defining relations

Relations can be added to a query in order to have the query apply not only to the main dataset the query is created from, but also to related records from other datasets.

Retrieving relations:

``` Javascript
...
let posts = client.dataset("posts");
let comments = client.dataset("comments");
posts.select().relation(comments).execute().then( (records) => {
  // objects in the records array will now contain a property called "comments"
  // which will be an array holding the comments related to a particular post.
});
```

### Inserting records

``` Javascript
...
let posts = client.dataset("posts");
posts.insert([ {title: "New Post", content:"content here"}, 
               {title: "Another Post", content:"some more content"} 
]).execute().then( (records) => {
  // you will be able to access the newly inserted records here
  // complete with their generated IDs
}).catch( (error) => {
  // you can see the error info here, if something goes wrong
});
```

### Modifying records

[Work in progress]

### Deleting records

``` Javascript
...
let posts = client.dataset("posts");
posts.delete().filter(condition("title", "like", "test")).execute().then( (records) => {
  // you will be able to access the deleted records here
  // they won't be stored in the DB anymore, but maybe you
  // want to display a visual confirmation of what got deleted
}).catch( (error) => {
  // you can see the error info here, if something goes wrong
});
```

## Real-time communication code samples

The real-time functionality is added through a separate module. The module needs to be imported, instantiated and initialized along with the client.

### Importing:

``` Javascript
import { RTCModule } from "Anemo SDK location";
```

### Instantiating:

The real-time module needs a websocket client in order to function.

When running the app in the browser, this dependency can be ignored, as the SDK will load the native browser implementation:

``` Javascript
let rtcmod = new RTCModule(
  (message) => { // do stuff with your real time notification here }
);
```

For Node.JS apps, a websocket client needs to be imported and a callback instantiating the websocket client must be passed to the real-time module, as in this example.

``` Javascript
import WebSocket from "your favorite Node.JS WebSocket implementation";

let rtcmod = new RTCModule(
  (message) => { // do stuff with your real time notification here },
  (appUrl) => new WebSocket(appUrl)
);

```

### Initializing:

The real-time module needs to be passed to the `Client` when initializing the latter. The `Client` accepts a spread parameter to define the modules that need to be initialized. 

``` Javascript
...
new Client(fetch).init({appUrl: "your Jexia App URL", key: "username", secret: "password"}, rtcmod).then( (initializedClient) => {
  // you have been succesfully logged in
  // you can start using the initialized rtcmod here
}).catch( (error) => {
  // there was a problem logging in or initializing the real-time module
});
```

### Subscribing to events:

After a succesful module initialization, the user can start subscribing to events. When a real-time message is pushed from the server, the callback defined when instantiating the real-time module will be called.

``` Javascript
...
let posts = client.dataset("posts");
rtcmod.subscribe("insert", posts);
```
