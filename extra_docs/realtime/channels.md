## Communication with channels

Real Time Module supports communications using channels. You can create channels with  [Jexia Web Management Application](https://docs.jexia.com/getting-started/user-management/).  
It is possible to send messages to the channel and everyone subscribed to that channel will immediately receive them.   
Channel is also able to keep messaging history.  
  
### Initialize  
To use real time communication initialize Jexia client with the real time module:  
  
``` javascript
import { jexiaClient, realTime } from "jexia-sdk-js";  
  
const rtm = realTime();  
  
jexiaClient().init({  
 projectID: "your-project-id",  key: "your-api-key",    
  secret: "your-api-secret"  
}, rtm);  
```  

After Jexia client has been initialized, you can obtain your channel object just by name:

```javascript
const channel = rtm.channel('my_channel');
```

  
### Subscribe to the channel events
Basically, channel object is inherited from the [RxJS Subject](https://rxjs-dev.firebaseapp.com/api/index/class/Subject), so just use `subscribe()` method: 
  
```javascript
channel.subscribe(message => {
  // you received a message here!
});
```

You can use `.pipe()` and any RxJS operators to have more flexibility:

```javascript
channel.pipe(
  filter(message => message.from === user.id), // filter only specific user
  pluck('data') // pull out only data field 
).subscribe(...);
```  
 
 ### Unsubscribe
 Use default RxJS `unsubscribe()` method:
 
 ```javascript
 const subscription = channel.subscribe();
subscription.unsubscribe();
 ``` 
  
### Publish to the channel
  
``` javascript
const message = 'Hey bro, did you feed our pet rhino?';  
channel.send(message).subscribe(); 
```  
  
### Get the message history  
  
``` javascript
channel.getLog().subscribe(log => {
  // you will recieve all the messages here
});  
```

It is also possible to use filters:
```jaascript
const filter = field("create_at").isLessThen("2006-01-02");
channel.getLog(filter).subscribe();
```
