# Datasets Module
A Dataset is a data storage where data is stored either using a strict schema or without it (schemaless). You are able to manipulate this data by creating, updating, fetching and deleting records and also to query over them by using conditions like `isEqualTo` and `isGreaterThen` (full list available in [FieldFilter API reference](../classes/FieldFilter.html)).

### [Initialize](#init)
To use dataset features, just add `dataOperations` module to the client initialization. Notice that when your application runs in NodeJS, you should import `dataOperations` from `jexia-sdk-js/node` and from `jexia-sdk-js/browser` when it runs in a browser.

```javascript
import { jexiaClient, dataOperations } from "jexia-sdk-js/node"; // "jexia-sdk-js/browser" for browser applications
const dataModule = dataOperations();

jexiaClient().init({
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
}, dataModule);
```

### [Getting a dataset object](#getting-dataset)
Dataset object can be received from the `dataModule` just by its name:
```javascript
const myDataset = dataModule.dataset("my_dataset");
```
It is also possible to get a list of datasets at a time:
```javascript
const [posts, authors] = dataModule.datasets(["posts", "authors"]);
```

Obtained object has all the methods to manage its data - `insert`, `select`, `update` and `delete`:
```javascript
const selectQuery = myDataset.select();
const insertQuery = myDataset.insert([post1, post2]);
const updateQuery = myDataset.update([{ title: "Updated title" }]);
const deleteQuery = myDataset.delete();
```
These methods return an Observable and allow you to use all the power of RxJS library ([RxJs documentation](https://rxjs.dev/guide/overview)).

Let's write something interesting. For example, we want to select records older than 1 day and put them into archive:
```javascript
// datasets
const posts = dataModule.dataset("posts");
const archive = dataModule.dataset("archive");

// Calculate yesterday's date
const date = new Date();
date.setDate(date.getDate() - 1);
const yesterday = date.toISOString();

posts.select()
  // get all records that had been created earlier than yesterday
  .where(field => field("created_at").isLessThan(yesterday))
  .pipe(
    // put them into archive!
    switchMap(records => archive.insert(records)),
  )
  .subscribe();
```

Pay attention that request to the dataset will not be sent until `subscribe()` method is called.

Let's have a look at each method.

### [Inserting records](#inserting-records)

Records can be inserted to a dataset either by sending an array or a single object. The response will always be an array though.

``` Javascript
const posts = dataModule.dataset("posts");

const insertQuery = posts.insert([
 { title: "New Post", content: "content here" },
 { title: "Another Post", content: "some more content" }
]);

// At this point nothing has happened yet
// we need to call subscribe in order to run a query
insertQuery.subscribe();

// Single record
const insertQuery = posts.insert({
 title: "New Post",
 content: "content here"
}).subscribe();

// Either way, the response will be an array
insertQuery.subscribe(records => {
     // you will always get an array of created records, including their generated IDs (even when inserting a single record)
  },
  error => {
     // you can see the error info here, if something goes wrong
});
```

### [Updating records](#updating-records)

The `update` method is used to modify records, it always has to be used with the `.where` method and a filter criteria.

```javascript
const posts = dataModule.dataset("posts");

posts
  .update({ title: "Same title for tom and harry posts" })
  .where(field => field("author_name").isInArray(["Tom", "Harry"]))
  .subscribe(affectedRecords => {
   /* [{ title: "Same title for tom and harry posts", author_name: "Tom" },
       { title: "Same title for tom and harry posts", author_name: "Tom" },
       { title: "Same title for tom and harry posts", author_name: "Harry" },
       { title: "Same title for tom and harry posts", author_name: "Tom" }]
    */
  });
```

### [Deleting records](#deleting-records)
 Deleting  also requires at least one condition:

``` javascript
const posts = dataModule.dataset("posts");

posts
  .delete()
  .where(field => field("title").isLike("%test%"))
  .subscribe(deletedFields => {
    // you will be able to access the deleted posts here
    // they are not stored in the DB anymore, but maybe you
    // want to display a visual confirmation of what was deleted
  });
```

### [Query records](#dataset-query-objects)

Query object, returned by `select()` method, has an ability to filter, order, limit and offset records. These methods have to be called in chain before `subscribe()`.

### [Our first query: selecting all records in a dataset](#select-all-dataset-records)

```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .subscribe(
    records => {
      // here are all your posts
    },
    error => {
      // some error happened
    }
  );
```

### [Sorting records](#sorting-records)

In order to sort records, you need to call `.sortAsc` or `.sortDesc` on a `Query` object and pass the name of the field you want to sort by.

```javascript
const posts = dataModule.dataset("posts");

posts
  .select()
  .sortAsc("created_at")
  .subscribe(records => {
    // you've got sorted records here
  });
```

### [Limit and offset](#limit-offset)

You can use `.limit` and `.offset` on a `Query` to paginate your records. They can be used separately or together. Only setting the limit (to a value X) will make the query operate on the first X records. Only setting the `offset` will make the query operate on the last Y records, starting from the `offset` value.

```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .limit(2)
  .offset(5)
  .subscribe(records => // paginatedPosts will be an array of 2 records, starting from position 5);
```

### [Only retrieving certain fields](#retrieve-certain-fields)

You can use `.fields` method to restrict fields you want to retrieve.

```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .fields("title", "author") // you can also pass an array of field names
  .subscribe(records => // you will get array of {id, title, author} records (id is always returned));
```

### [Aggregation functions](#aggregation-function)

There are a few aggregation functions you are able to use in order to do some calculations before obtaining data:

```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .fields({ fn: "count", field: "*" })
  .subscribe(result => {
    /* the result is an array with one record (let's say we have 5 posts):
       [{
          count: 5
       }]
     */
  });
```

You can provide an alias to make result more readable (using aliases is the only way to get proper results if you want to query two or more the same aggregation functions in one query):

```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .fields({ fn: "max", field: "likes": alias: "likes" })
  .subscribe(result => {
    /* the result is:
       [
         { "likes": 24 },
       ]
     */
  });
```

You can also use any sets of plain fields and functions. Let's calculate the maximum of likes each author has received:
```javascript
const posts = dataModule.dataset("posts");

posts.select()
  .fields("author", { fn: "max", field: "likes" })
  .subscribe(result => {
    /* the result is:
       [
         { author: "Tom", "max": 10 },
         { author: "Harry", "max": 24 },
       ]
     */
  });
```

The full list of available aggregation functions:
* max
* min
* sum
* avg
* count


### [Filtering records](#filtering-records)

You can use the filtering to select what records a certain query will operate on.

In order to define a filter, you can use the exposed method `field`.

```javascript
import { field } from "jexia-sdk-js/node";

const isAuthorTom = field("author_name").isEqualTo("Tom");
const isAuthorDick = field("author_name").isEqualTo("Dick");
const isAuthorTomOrDick = isAuthorTom.or(isAuthorDick);

// In order to use these conditions, they need to be added to a query through `.where` method

dataModule.dataset("posts")
 .select()
 .where(isAuthorTomOrDick)
 .subscribe(records => // posts of Tom and Dick);
```

If you prefer, `.where` method also accepts a lazy callback, that receives the `field` method received as an argument:

```javascript
dataModule.dataset("posts")
 .select()
 .where(field => field("author_name").isEqualTo("Harry"));
```

Multiple `.where` calls can be chained, but only the last call will be taken into account. If a complex condition needs to be set for filtering, it has to be created in one go (in-line or not) and passed as an argument to the `.where` method.

Filtering conditions can be nested at any level.

```javascript
// Filtering in a flat way
const isPostedByTomAndIsAboutSports = field("author_name")
 .isEqualTo("Tom").and(field("title").isLike("sports"));

// Filtering with one nested level
const isPostedByDickAndIsAboutMusic = field("author_name")
 .isEqualTo("Dick").and(field("title").isLike("music"));

const isTomOrIsDickHarry = field("author_name")
 .isEqualTo("Tom").or( isPostedByDickAndIsAboutMusic // nested level );

// Filtering with multiple nested levels
const isAuthorDutch = field("author_country").isEqualTo("NL");
const isKidOrSenior = field("author_age")
 .isGreaterThan(64).or(field("author_age").isLessThan(16));
const isTomAndIsDuthOrKidOrSenior = field("first_name")
 .isEqualTo("Tom").and( isAuthorDutch.or(isKidOrSenior) );
```

### [Filtering operator list and examples](#filtering-operator-list)

You can find a complete list of the operators supported for filtering in the [FieldFilter API reference](../classes/FieldFilter.html).
