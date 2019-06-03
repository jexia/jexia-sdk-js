# Real Time Module Documentation
The SDK supports real time notifications about `CREATE`, `UPDATE` and `DELETE` operations on DataSets using *Observable*.

### Initialize RealTime Module
To use real time notifications, `RealTimeModule` has to be initialized alongside with `DataOperationsModule`:

``` javascript
// import dependencies from jexia SDK bundle
import { jexiaClient, dataOperations, realTime } from "jexia-sdk-js/node";

// Initialize DataOperationsModule
const dataModule = dataOperations();

// initialize jexia client
jexiaClient().init(credentials, dataModule, realTime());
```

### Subscribe for notifications
Now you can use `watch()` method to subscribe for notifications. Actions can be provided either as arguments or
as an array.
Allowed values are:

- `created`
- `updated`
- `deleted`
- `all` (used by default)

Here is an example of usage:

``` javascript
const subscription = dataModule.dataset("posts")
  .watch("created", "deleted")
  .subscribe((messageObject) => {
    console.log("Realtime message received:", messageObject.data.title);
  }, (error) => {
    console.log(error);
  });
```

### Unsubscribe from notifications
Just use default observable api to unsubscribe from notifications. 
``` javascript
subscription.unsubscribe();
```
