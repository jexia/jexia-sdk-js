# Datasets Module
A Dataset ia a data storage where data is stored either using a strict schema or without it (schemaless). You are able to manipulate this data by creating, updating, fetching and deleting records, and also to query over them by using conditions like `isEqualTo` and `isGreaterThen` (full list available in [FieldFilter API reference](../classes/FieldFilter.html)).


### [Initialize](#init) 
To use dataset features, just add `dataOperations` module to the client initialization. Notice, that for Node.js
you have to import `dataOperations` from `jexia-sdk-js/node`, but if you are running your application in a browser, you should import it from `jexia-sdk-js/browser`.

```typescript
import { jexiaClient, dataOperations } from "jexia-sdk-js/node"; // "jexia-sdk-js/browser" for browser applications

const dataModule = dataOperations();

jexiaClient().init({
  projectID: "<your-project-id>",
  key: "<your-project-api-key>",
  secret: "<your-project-api-secret>",
}, dataModule);
```

### [Inserting records](#inserting-records)

Records can be inserted to a dataset either by sending an array or a single one. The response will always be an array though.

``` Javascript
[..]
const posts = dataModule.dataset("posts");

// Multiple records
const insertQuery = posts.insert([
  { title: "New Post", content: "content here" },
  { title: "Another Post", content: "some more content" },
]);

// Single record
const insertQuery = posts.insert({
  title: "New Post",
  content: "content here",
});

// Either way, the response will be an array
insertQuery
  .execute()
  .then((records) => {
    // you will always get an array of created records, including their generated IDs (even when inserting a single record)
  }).catch((error) => {
    // you can see the error info here, if something goes wrong
  });
[..]
```

### [Updating records](#updating-records)

The `update` method is used to modify records, it always has to be used with the `.where` method and a filter criteria.

``` Javascript
[..]
try {
  const filter = field("author_name").isInArray(["Tom", "Harry"]);
  const affectedRecords = await dataModule
    .dataset("posts")
    .update({ title: "Same title for tom and harry posts" })
    .where(filter)
    .execute();

  console.log(affectedRecords);
  // output: 
  // [
  //   { title: "Same title for tom and harry posts", author_name: "Tom" }, 
  //   { title: "Same title for tom and harry posts", author_name: "Tom" }, 
  //   { title: "Same title for tom and harry posts", author_name: "Harry" }, 
  //   { title: "Same title for tom and harry posts", author_name: "Tom" }, 
  //   ...
  // ]
} catch (error) {
  // you can see the error info here, if something goes wrong
}
```

### [Deleting records](#deleting-records)

``` Javascript
[..]
try {
  const posts = await dataModule.dataset("posts")
    .delete()
    .where(field("title").isLike("test"))
    .execute();
    
  // you will be able to access the deleted posts here
  // they won't be stored in the DB anymore, but maybe you
  // want to display a visual confirmation of what was deleted
} catch (error) {
  // you can see the error info here, if something goes wrong
}
[..]
```

### [Query objects](#dataset-query-objects)
Using an initialized dataset module, you can get `Dataset` objects like:

``` Javascript
[..]
const postsDataset = dataModule.dataset("posts");
[..]
```

Using a `Dataset` object, you can get a `Query` object by calling the basic operation methods like:

``` Javascript
[..]
const selectQuery = postsDataset.select();
const insertQuery = postsDataset.insert([post1, post2]);
const updateQuery = postsDataset.update([{ title: "Updated title" }]);
const deleteQuery = postsDataset.delete();
[..]
```

At this moment the `Query` is not executed yet, you need to call `.execute()` in order to start the request. `.execute()` returns a `Promise` resolving to a set of records, regardless of the type of `Query` executed.

Each different `Query` type has different support for query options (filtering, sorting, etc.). By the way, you cannot add queries to `InsertQuery` as it does not implement `.where` (and it wouldn't make any sense to do so, right?).

### [Our first query: selecting all records in a dataset](#select-all-dataset-records)

Notice that some variables used by the following examples are for demonstration purposes, mostly to point out the different objects and functionality involved when working with records.

``` Javascript
[..]
jexiaClient().init(credentials, dataModule);

const postsDataset = dataModule.dataset("posts");
const unexecutedQuery = postsDataset.select();
const executedQueryPromise = unexecutedQuery.execute();

try {
  const posts = await executedQueryPromise;
  // you can start iterating with posts here
} catch (error) {
  // there was a problem retrieving the records 
}
[..]
```

If you watch closely, the API is chainable, so you can rewrite the query in a much less verbose way:

``` Javascript
[..]
jexiaClient().init(credentials, dataModule);

try {
  const posts = await dataModule.dataset("posts")
    .select()
    .execute();
  // you can start iterating with posts here
} catch (error) {
  // there was a problem retrieving the records 
}
[..]
```

But at the very least, defining dataset variables could come in handy when executing multiple different queries on the same dataset.

### [Sorting records](#sorting-records)

In order to sort records, you need to call `.sortAsc` or `.sortDesc` on a `Query` object and pass the name of the field you want to sort by.

``` Javascript
[..]
const sortedPosts = await dataModule.dataset("posts")
  .select()
  .sortAsc("created_at")
  .execute();

console.log(sortedPosts)
// output: 
// [
//   { created_at: "2019-01-10T00:00:32.000Z", author_name: "Tom" }, 
//   { created_at: "2019-02-15T00:10:00.000Z", author_name: "Helen" }, 
//   { created_at: "2008-02-16T00:12:00.000Z", author_name: "Harry" },
//   { created_at: "2008-02-16T10:45:00.000Z", author_name: "Mary" },
//   ...
// ]
[..]
```

### [Limit and offset](#limit-offset)

You can use `.limit` and `.offset` on a `Query` to paginate your records. They can be used separately or together. Only setting the limit (to a value X) will make the query operate on the first X records. Only setting the `offset` will make the query operate on the last Y records, starting from the `offset` value.

``` Javascript
[..]
const paginatedPosts = await dataModule.dataset("posts")
  .select()
  .limit(2)
  .offset(5)
  .execute();

// paginatedPosts will be an array of 2 records, starting from position 5
[..]
```

### [Only retrieving certain fields](#retrieve-certain-fields)

You can use `.fields` method to restrict fields you want to retrieve.

``` Javascript
[..]
const posts = await dataModule.dataset("posts")
  .select()
  .fields("id", "title") // you can also pass an array of field names too
  .execute();

console.log(posts);
// output:
// [ 
//   { id: "78574c6a-b5a0-45da-a589-9671a88f7f53", title: "Some post title" },
//   { id: "1b118939-85fc-47f0-9b4f-a6de00922e15", title: "Some other post title" },
// ]
[..]
```

### [Filtering records](#filtering-records)

You can use the filtering to select what records a certain query will operate on.

In order to define a filter, you can use the exposed method `field`.

``` Typescript
import { field } from "jexia-sdk-js/node";

const isAuthorTom = field("author_name").isEqualTo("Tom");
const isAuthorDick = field("author_name").isEqualTo("Dick");
const isAuthorTomOrDick = isAuthorTom.or(isAuthorDick);

// In order to use these conditions, they need to be added to a query through `.where` method

dataModule.dataset("posts")
  .select()
  .where(isAuthorTomOrDick);

[..]
```

If you prefer, `.where` method also accepts a lazy callback, that receives the `field` method received as an argument:

``` Javascript
[..]
dataModule.dataset("posts")
  .select()
  .where(field => field("author_name").isEqualTo("Harry"));
[..]
```

Multiple `.where` calls can be chained, but only the last call will be taken into account. If a complex condition needs to be set for filtering, it has to be created in one go (in-line or not) and passed as an argument to the `.where` method.

Filtering conditions can be nested at any level.

``` Javascript
[..]
// Filtering in a flat way
const isPostedByTomAndIsAboutSports = field("author_name")
  .isEqualTo("Tom")
  .and(field("title").isLike("sports"));

// Filtering with one nested level
const isPostedByDickAndIsAboutMusic = field("author_name")
  .isEqualTo("Dick")
  .and(field("title").isLike("music"));

const isTomOrIsDickHarry = field("author_name")
  .isEqualTo("Tom")
  .or(
    isPostedByDickAndIsAboutMusic // nested level
  );

// Filtering with multiple nested levels
const isAuthorDutch = field("author_country").isEqualTo("NL");
const isKidOrSenior = field("author_age")
  .isGreaterThan(64)
  .or(field("author_age").isLessThan(16));

const isTomAndIsDuthOrKidOrSenior = field("first_name")
  .isEqualTo("Tom")
  .and(
    isAuthorDutch.or(isKidOrSenior)
  );
[..]
```

### [Filtering operator list and examples](#filtering-operator-list)

You can find a complete list of the operators supported for filtering in the [FieldFilter API reference](../classes/FieldFilter.html).

