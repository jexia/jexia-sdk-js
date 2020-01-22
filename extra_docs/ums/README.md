# Jexia User Management System Module (UMS) 
UMS provides an ability to manage user accounts, sign-up and sign-in to the Jexia project with these accounts and perform  data changes with permissions of any authorized user. There are two ways to create a new user:   
  
1. You can use [Web Management Application](https://docs.jexia.com/getting-started/user-management/) and create  users one by one with nice UI.   
2. You can use `signup()` method of User Management Module  
  
#### Return values
Some of the methods of this module such as `select()`, `update()` and `delete()` return observable, but other return `Promise` type. This might be changed soon and all methods will return an observable.  
  
### Initialize  
If you want to use UMS module, just add it to the Jexia Client initialization:  
```javascript 
import { jexiaClient, UMSModule } from "jexia-sdk-js";  
  
const ums = new UMSModule();   
jexiaClient().init({    
  projectID: "your-project-id",    
  key: "your-api-key",    
secret: "your-api-secret" }, ums); 
```    
 If you are going to use UMS authorization, you can omit key/secret options,   
 but this requires UMS signing in before making any data request:  
```javascript  
jexiaClient().init({    
 projectID: "your-project-id"  
}, ums); 
```

### Sign-in user to the Jexia project  
UMS uses email and password as user credentials. User account should exist in a project.    
Additional options (both are optional):  
- **default**  
  if true, this user account will be used for all further data operations by default  
- **alias**  
  account alias. You can use it to clarify which account is going to be used to perform data operation  
   
```javascript 
const user = await ums.signIn({    
  email: 'Elon@tesla.com',    
  password: 'secret-password',    
  default: false,   
  alias: 'Elon Musk'  
});  
```

### Perform data operation on behalf of a user 
If user successfully signed in, his alias can be used to get access to the datasets, filesets or any other project data.   
You can also use user's email as an alias or, if `default` option was set to true, do not specify alias at all.  
  
Use alias:     
```javascript 
dom.dataset('rockets', 'Elon Mask').select();  
```    
 Use email:  
```javascript 
dom.dataset('rockets', 'Elon@tesla.com').select(); 
```    
   
Omit alias, default user will be used.:  
```javascript 
ums.signIn({    
  email: 'Elon@tesla.com',    
  password: 'secret-password',    
  default: true  
});   
dom.dataset('rockets').select(); 
```      

### Set default user  
You can set default user with `setDefault()` method. After this all data operations will use Elon's permissions:  
```javascript 
ums.setDefault('Elon Musk'); 
```    

### Reset authorization  
With `resetDefault()` method you can switch back to default project authorization. Usually it is `apiKey` auth:  
```javascript 
ums.resetDefault();  
```

### Create a new user (Sign-up)  
You can sign up a new user to the project.  
```javascript 
const user = await ums.signUp({    
  email: "robert@company.com",    
  password: "qwert1234" 
});  
  
/* returned user: 
{  
 id: "005c8679-3fad-46fd-a93f-9484ea8ff738",
 email: "robert@company.com", 
 active: true, 
 created_at: "2017-12-31T23:59:59.123456Z", 
 updated_at: "2017-12-31T23:59:59.123456Z"
} */  
```

You can also pass an extra fields during sing-up. These fields will be saved in the UMS and you can receive them by
"getUser()" method:
```javascript
const user = await ums.signUp(
  { email: "john@company.com", password: "rewq4321" },
  { 
    age: 25, 
    address: { 
      city: "Apeldoorn",
      country: "NL"
    }
  }
);

/* returned user:
{
    "active": true,
    "address": {
        "city": "Apeldoorn",
        "country": "NL"
    },
    "age": 25,
    "created_at": "2020-02-12T11:09:36.017824Z",
    "email": "john@company.com",
    "id": "736afb7d-fbc2-4ef2-9ffe-bbdc454e68a3",
    "updated_at": "2020-02-12T11:09:36.017824Z"
} */
```

### Fetch user by alias alias (or email) 
```javascript 
 const user = await ums.getUser('Elon Musk'); 
```
 
### Change user password 
```javascript
ums.changePassword('Elon@tesla.com', oldPassword, newPassword); 
```

### Delete user  
You need to provide current user password to delete account:  
```javascript 
ums.deleteUser('Elon@tesla.com', password); 
```
  
### Manage user  
It is also possible to use CRUD methods `select()`, `update()` and `delete()`. They have the same syntax  and return values as corresponding data operations methods.  
All these methods return observables.   
To get more information see [Dataset Module Documentation](https://jexia.github.io/jexia-sdk-js/additional-documentation/dataset-operations.html)  
  
Examples:  
```javascript  
// select all active users  
ums.select()  
 .where(field => field("active").isEqualTo(true))  
 .subscribe();  
```
```javascript  
// suspend Elon!  
ums.update({ active: false })  
 .where(field => field("email").isEqualTo("Elon@tesla.com"))  
 .subscribe();  
```
```javascript  
// delete all suspended users  
ums.delete()  
 .where(field => field("active").isEqualTo(false))  
 .subscribe();  
```

### Change/reset user password
User's password can be changed whether the current password is known by calling:
```javascript
ums.changePassword('Elon@tesla.com', currentPassword, newPassword);
```
\
When the current password isn't known, you need to request a password reset:
```javascript
ums.requestResetPassword('Elon@tesla.com');
```
\
If provided email is valid and exists the user will receive an e-mail with instructions to reset their password. This e-mail will include a reset token, that should be used to reset his password:
```javascript
ums.resetPassword(receivedResetToken, newPassword);
```
