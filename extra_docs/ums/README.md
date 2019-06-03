# Jexia User Management System Module (UMS)
UMS provides an ability to create user accounts, sign-in to the Jexia project with these accounts and perform 
data changes with permissions of any authorized user. Users can be created either 
with [Web Management Application](https://docs.jexia.com/getting-started/user-management/) or 
with `signup()` method of this module.  

#### Return values
Module methods that require backend operations always return `Promise` type. 
To obtain a value from it you can use either `then()` method or async function call. 
All further examples are written with `async`.

### Initialize
If you want to use UMS module, just add it to the Jexia Client initialization:
```javascript  
import { jexiaClient, UMSModule } from "jexia-sdk-js";

const ums = new UMSModule(); 

jexiaClient().init({  
  projectID: "your-project-id",  
  key: "your-api-key",  
  secret: "your-api-secret"  
}, ums); 
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
);
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
