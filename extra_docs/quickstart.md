# Quick Start Guide for Jexia Javascript SDK

Jexia SDK currently exposes the following features:
  - On-demand access to data stored in Datasets and Filesets (CRUD operations, file uploads)
  - Authentication and authorization under the platform, you only need to provide your credentials.

Currently SDK is focused on *consuming* data. In order to manage data schema (creating Datasets, adding fields to them, etc.) you need to use our [web application](https://app.jexia.com). We suggest you read the guide [Start your first project](https://www.jexia.com/en/docs/getting-started/).

### On-demand data access
The user can execute the following operations on records:
  - CREATE
  - READ
  - UPDATE
  - DELETE

Executing an operation on a set of records is done through a Query. Depending on their type, Queries give the user access to some (or all) of the following options:
  - Filtering (only records satisfying a certain condition will be retrieved/affected)
  - Sorting (the records will be sorted by a rule and direction before the action is executed)
  - Limiting/offsetting (only a certain number of records, starting from a certain position in the Dataset will be affected)
  - Selecting the fields to be retrieved (when the user does not want the entire record to be retrieved, only certain columns)

Important to notice that all these features are handled server-side.

## Code samples

Please keep in mind that this quick start guide uses ECMAScript 8 or sometimes TypeScript syntaxes.

The examples are made with a simple data schema in mind: think a basic social media platform where `users` can write `posts` and/or `comments` to `posts`. A `post` can be related to any number of `comments`, while each `post` and each `comment` has a `user` as author.

### [Importing the SDK into your JS project](#importing-sdk)

#### In a NodeJS application:
``` Javascript
import { jexiaClient } from "jexia-sdk-js/node";
```

#### In the browser:
``` Javascript
import { jexiaClient } from "jexia-sdk-js/browser";
```

### [Initialization and Authentication](#init-sdk)

The `jexiaClient()` function will return a `Promise` of the `Client` class. You can provide a custom `fetch` standard compliant function as a parameter, as default we are using `node-fetch` package at NodeJS, and the native browser's `fetch` implementation.

``` Typescript
import { Client } from "jexia-sdk-js";
import { jexiaClient } from "jexia-sdk-js/node";

const clientPromise: Promise<Client> = jexiaClient()
  .init({
    projectID: "<your-project-id>",
    key: "<your-project-api-key>",
    secret: "<your-project-api-secret>",
  });

clientPromise.then((client: Client) => {
  // you have been succesfully logged in!
}).catch((error: Error) => {
  // uh-oh, there was a problem logging in, check error.message for more info
});
```

### [The Module system](#the-module-system)

Jexia SDK is built as a set of modules structured around a core entity (the `Client` class used above).
In order to use a module you need to:

1. Initialize it
2. Pass it to the `Client` when calling the `.init()` method

The example below will show how to initialize SDK using Datasets Module. The modules await the client initialization before make any operations, so you don't need to manually await for client's initialization `Promise`.

``` Javascript
import { jexiaClient, dataOperations } from "jexia-sdk-js/node";

const dataModule = dataOperations();
jexiaClient().init(credentials, dataModule);

dataModule.dataset("posts")
  .select()
  .execute()
  .then(data => {
    // you have been succesfully logged in!
    // you can start using the dataModule variable to operate on records here
  }).catch(error => {
    // uh-oh, there was a problem logging in, check the error.message for more info
  });
```

### [Logging off and cleanup](#logging-off)

The `Client` class exposes a method called `.terminate()`. Use this to clear up resources used by the `Client` and any modules you initialized along with it (`Client` will terminate any modules you supplied on initialization, so you don't have to pass them.)

``` Javascript
[..]
client
  .terminate()
  .then(terminatedClient => {
    // everything has been cleared
  }).catch(error => {
    // something went wrong when cleaning up
  });
[..]
```
