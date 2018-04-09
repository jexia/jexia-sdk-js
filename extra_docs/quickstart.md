# Quick Start Guide for the Javascript SDK

The SDK currently exposes the following features:
  - on-demand access to data stored in DataSets (creating, reading, updating, deleting records)
  - Authentication and authorization is handled automatically by the SDK, the user only needs to provide credentials once at SDK initialization.

The SDK is currently focused on *consuming* data. *Managing* the data schema (creating Datasets, adding columns to Datasets, etc.) is out of scope for now. The data schema management is done through our web application at [app.jexia.com](app.jexia.com).

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

## Code samples

Please keep in mind that this quick start guide uses Javascript 2017 syntax.

The examples are made with a simple data schema in mind: think a basic social media platform where `users` can write `posts` and/or `comments` to `posts`. A `post` can be related to any number of `comments`, while each `post` and each `comment` has a `user` as author.

### Importing the SDK into your JS project

``` Javascript
import { jexiaClient } from "Anemo SDK location";
```

### Initialization and Authentication

The `jexiaClient()` function will return an instance of the `Client` class. You can provide a custom `fetch` standard compliant function as a parameter, as default we are using are using `node-fetch` package at NodeJS, and the native `fetch` implementation on at the browser.

``` Javascript
import { jexiaClient } from "Anemo SDK location";

let initializedClientPromise = jexiaClient().init({projectID: "your Jexia App URL", key: "username", secret: "password"});
initializedClientPromise.then( (initializedClient) => {
  // you have been succesfully logged in!
}).catch( (error) => {
  // uh-oh, there was a problem logging in, check the error.message for more info
});
```

### The Module system

The Jexia SDK is built as a set of modules (or plugins) structured around a core entity (the `Client` class used above).
In order to use a module you need to:

- initialize it
- pass it to the `Client` when calling the `.init()` method

Probably the most useful module is the Data Operation Module (`DataOperationsModule` class). The example below will show how to initialize the SDK using this module. Follow the `dataModule` variable to see how this mechanism works.

The modules await the client initialization before make any operation that depends on it, so you don't need to manually await the client initialization promise.

``` Javascript
import { jexiaClient, dataOperations } from "Anemo SDK Location";

let dataModule = dataOperations();

jexiaClient().init({projectID: "your Jexia App URL", key: "username", secret: "password"}, dataModule);

dataModule.dataset("posts")
  .select()
  .execute()
  .then( (data) => {
    // you have been succesfully logged in!
    // you can start using the dataModule variable to operate on records here
  }).catch( (error) => {
    // uh-oh, there was a problem logging in, check the error.message for more info
  });
```

### Dataset objects and Query objects

Using an initialized `DataOperationsModule` object, you can instantiate `Dataset` objects like so:

``` Javascript
[..]
let postsDataset = dataModule.dataset("posts");
[..]
```

Using a `Datase` object, you can instantiate a `Query` object, depending on the type of query you want to execute

``` Javascript
[..]
let selectQuery = postsDataset.select();
let insertQuery = postsDataset.insert( [ post1, post2 ] );
let updateQuery = postsDataset.update( [ title: "Updated title" ] );
let deleteQuery = postsDataset.delete();
[..]
```

Any `Query` can be executed by calling `.execute()` on it. This results in a `Promise` resolving to a set of records, regardless of the type of `Query` executed. For select queries, the records returned are the records that the user wants to retrieve. For the other queries, the records returned are the actual records that have been operated on (modified, added or deleted).

Each different `Query` type has different support for the query options (filtering, sorting, etc.). E.g. you cannot apply filtering to insert queries, as the method isn't defined on the `InsertQuery` object.

### Our first query: selecting all records in a dataset

Using all the temporary variables in this example is for demonstration purposes, mostly to point out the different objects and functionality involved when working with records.

``` Javascript
[..]
jexiaClient(fetch).init({projectID: "your Jexia App URL", key: "username", secret: "password"}, dataModule);

let postsDataset = dataModule.dataset("posts");
let unexecutedQuery = postsDataset.select();
let executedQueryPromise = unexecutedQuery.execute();

executedQueryPromise.then( (records) => {
  // you can start iterating through the posts here
}).catch( (error) => {
  // there was a problem retrieving the records
});
[..]
```

If you watch closely, the API is chainable, so you can rewrite the query in a much less verbose way:

``` Javascript
[..]
jexiaClient(fetch).init({projectID: "your Jexia App URL", key: "username", secret: "password"}, dataModule);

dataModule.dataset("posts")
  .select()
  .execute()
  .then( (records) => {
    // you can start iterating through the posts here
  }).catch( (error) => {
    // there was a problem retrieving the records
  });
[..]
```

But at the very least, defining dataset variables could come in handy when executing multiple different queries on the same dataset.

### Sorting records

To activate sorting, you need to call `.sortAsc` or `.sortDesc` on a `Query` object and pass as string the name of the field you want to sort by.

``` Javascript
[..]
posts.select().sortAsc("id").execute().then( (records) => {
  // operate on your sorted records here
});
[..]
```

### Limit and offset

You can use `.limit` and `.offset` on a `Query` object for these options. They can be used separately or together. Only setting the limit (to a value X) will make the query operate on the first X records. Only setting the offset will make the query operate on the last Y records, starting from the offset value. 

``` Javascript
[..]
posts.select().limit(2).offset(5).execute().then( (records) => {
  // records will be an array of 2 records, starting from position 5 in the Dataset
});
[..]
```

### Only retrieving certain fields

You can use the `.fields` method to define what fields you want to retrieve.

``` Javascript
[..]
posts.select().fields("id", "title").execute().then( (records) => {
  // the individual record objects will only have the two properties defined above
});
[..]
```

### Filtering records

You can use the filtering feature to select what records a certain query will operate on.

In order to define a filter, you need to use the appropriate filtering objects. They can be created using the exposed methods `field` and `combineCriteria`. `combineCriteria` is something very specific that provides another way to create nested logical conditions. You're probably not going to use that much, but it's useful to know that it exists.

``` Javascript
import { field } from "Anemo SDK location";

let simpleCriterion = field("username").isEqualTo("Tom");
let combinedCriteria = simpleCriterion.or(field("username").isEqualTo("Dick"));
```

In order to use these conditions, they need to be added to a query using the `.where` method

``` Javascript
[..]
posts.select().where(field("username").isEqualTo("Harry"));
[..]
```

The `.where` method also accepts a lazy callback, that receives the `field` method received as an argument:

``` Javascript
[..]
posts.select().where(field => field("username").isEqualTo("Harry"));
[..]
```

Multiple `.where` calls can be chained, but only the last call will be taken into account. If a complex condition needs to be set for filtering, it has to be created in one go (in-line or not) and passed as an argument to the `.where` method.

Filtering conditions can be nested at any level.

``` Javascript
[..]
let flatFilter = field("first_name").isEqualTo("Tom")
                 .or( field("first_name").isEqualTo("Dick"))
                 .or( field("first_name").isEqualTo("Harry"));

let nestedFilter = field("first_name").isEqualTo("Tom")
                   .or( field("first_name").isEqualTo("Dick")
                        .and( field("middle_name").isEqualTo("Harry")));

let anotherNestedFilter = field("first_name").isEqualTo("Tom")
                   .or( field("first_name").isEqualTo("Dick")
                        .and( field("middle_name").isEqualTo("Harry")
                              .or( field("middle_name").isEqualTo("Larry"))));
[..]
```

### Filtering operator list and examples

You can find a complete list of the operators supported for filtering in the API reference document.

### Defining relations

Relations can be added to a query in order to have the query apply not only to the main dataset the query is created from, but also to related records from other datasets.

Retrieving relations:

``` Javascript
[..]
let posts = dataModule.dataset("posts");
let comments = dataModule.dataset("comments");
posts.select().relation(comments).execute().then( (records) => {
  // objects in the records array will now contain a property called "comments"
  // which will be an array holding the comments related to a particular post.
});
[..]
```

### Inserting records

``` Javascript
[..]
let posts = dataModule.dataset("posts");
posts.insert([ {title: "New Post", content:"content here"}, 
               {title: "Another Post", content:"some more content"} 
]).execute().then( (records) => {
  // you will be able to access the newly inserted records here
  // complete with their generated IDs
}).catch( (error) => {
  // you can see the error info here, if something goes wrong
});
[..]
```

### Updating records

The `update` method is used to modify records, it always has to be used with the `where` method and a filter criteria.

``` Javascript
[..]
let posts = dataModule.dataset("posts");
const filter = field("id").isInArray([1, 2]);
posts.update({
  title: "Changing title",
}).where(filter).execute().then(() => {
  // the elements that fill the criteria now have been changed
}).catch( (error) => {
  // you can see the error info here, if something goes wrong
});
```

### Deleting records

``` Javascript
[..]
let posts = dataModule.dataset("posts");
posts.delete().where(field("title").isLike("test")).execute().then( (records) => {
  // you will be able to access the deleted records here
  // they won't be stored in the DB anymore, but maybe you
  // want to display a visual confirmation of what got deleted
}).catch( (error) => {
  // you can see the error info here, if something goes wrong
});
[..]
```

## Logging off and cleanup

The `Client` class exposes a method called `.terminate()` which returns a `Promise` with the terminated `Client` instance. Use this to clear up resources used by the `Client` class and any modules you initialized along with it (you don't have to pass the modules along, the `Client` will terminate any modules you supplied on initialization.)

``` Javascript
[..]
client.terminate().then( (terminatedClient) => {
  // everything has been cleared
}).catch( (err)=>{
  // something went wrong when cleaning up
});
[..]
```
