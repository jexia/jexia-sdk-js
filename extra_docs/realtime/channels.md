## Communication with channels

Client-side applications can communicate with each other in real-time using channels which basically, allows sending and receiving messages through websocket. 
Before using this feature, you need to create at least one channel and an appropriate policy with allowed "publish" and "subscribe" actions. Channels can be managed with [Jexia Web Management Application](https://docs.jexia.com/getting-started/user-management/).  

When an application sends a message to the channel, everyone subscribed to that channel immediately receives it. If the persistent store is activated for the channel (using management application), it is also possible to get messaging history.

For more information about channels management, message size limitations and so, please read the official [Jexia documentation page](https://www.jexia.com/en/docs/jexia-pub-sub-service/).  
  
### Initialize  
To use real-time communication initialize Jexia client with the real-time module:  
  
``` javascript
import { jexiaClient, realTime } from "jexia-sdk-js";  
  
const rtm = realTime();  
  
jexiaClient().init({  
  projectID: "your-project-id",  
  key: "your-api-key",    
  secret: "your-api-secret"  
}, rtm);  
```  

Then you can get your channel object (considered that channel has been already created in management application, otherwise an error will be thrown, see "Handling errors" below):

```javascript
const channel = rtm.channel("my_channel");
```

  
### Subscribe to the channel events
Basically, channel object is inherited from the [RxJS Observable](https://rxjs.dev/api/index/class/Observable), so just use `subscribe()` method: 
  
```javascript
channel.subscribe(message => {
  // you received a message here!
});
```

You can use `.pipe()` and any RxJS operators to have more flexibility:

```javascript
channel.pipe(
  filter(message => message.from === user.id), // filter only specific user
  pluck("data") // pull out only data field 
).subscribe(data => {
  // you've got data from the specific user here!
});
```  
 
 ### Unsubscribe

 Don't forget to unsubscribe in case there is no needs to get messages from the channel anymore, just the use default RxJS `unsubscribe()` method:
 
 ```javascript
 const subscription = channel.subscribe();
subscription.unsubscribe();
 ``` 
  
### Publish to the channel

You can publish any valid JSON type to the channel. Here is publishing a string example:
  
``` javascript
const message = "Hey bro, did you feed our home rhino?";  
channel.publish(message); 
```  

It is also can be an object:
```javascript
channel.publish({
  product: "apple",
  amount: 42
});  
```
  
### Get the message history  
  
```javascript
channel.getLog().subscribe(log => {
  // you will receive an array of all the messages here (see schema below)
});  
```

It is also possible to use filters:
```javascript
// load messages from the specific user
channel.getLog(field => field("sender_id").isEqualTo(user.id));
```

#### Stored message schema
```JSON
[{
  id: string, // uuid 
  sender_id: string, // uuid 
  sender_type: string, // either "apk" or "ums",
  created_at: string, // Date in ISO format 
  updated_at: string, // Date in ISO format
  data: any,
}, {...}, ...]
```

### Errors handling

Some errors can happen during communications - channel might have not been created, a policy was incorrect or network troubles could occur. Any of those errors will be thrown from the observable and could be caught with the error handler.

In this example there is no such channel:
```javascript
rtm.channel("my_camel").subscribe(
  message => {
    console.log(message); // we've got a message from the channel
  },
  error => {
    console.log(error); // Subscription Error: (1001): resource "my_camel" is unavailable
  },
  () => { // complete
    // connection to the channel has been closed
  }
);
```

You tries to get channel history, but policy does not allow you to read from the channel:
```javascript
rtm.channel("not_my_channel").getLog().subscribe(
  messages => {
    console.log(messages); 
  },
  error => {
    console.log(error); // Subscription Error: (2): none of the given actions ["read"] for this resource are allowed
  }
);
```
