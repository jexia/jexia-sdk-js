### Initialize UMS module
```javascript
const ums = new UMSModule();
```

### Initialize Jexia Client with UMS module
```javascript
jexiaClient().init({
  /* we have to pass project id, otherwise SDK does not know what project we are going to use */
  projectID: process.env.E2E_PROJECT_ID as string,

  /* Here we provide ApiKey in order to have an access to our project
   * this authorization will get alias 'apikey' and will be used by default
   */
  key: 'example-api-key',
  secret: 'example-secret',

  /* optional field, set alias for this authorization
   * will be 'apikey' if skipped */
  auth: 'basic access'

}, ums, dom);
```

### UMS module can be used to sign-up, sign-in and other operations
```javascript
ums.signIn({
  email: 'Elon@tesla.com',
  password: 'secret-password',
  default: false, // this auth will be used by default if true
  auth: 'Elon Musk' // I think we can use 'auth' instead of 'alias', therefore useAuth() method will have more sense
}); /* returns Promise which will contain user id */
```

### If User successfully signed in, his alias can be used to get access to the datasets
```javascript
dom.useAuth('Elon Mask').dataset('rockets').select(); /* any operations that allowed to Elon
```

### User's email can be used as well as alias (or in case of alias wasn't provided)
```
dom.useAuth('Elon@tesla.com').dataset('rockets').select();
```

### without *useAuth()* ApiKey auth is used
```javascript
dom.dataset('rockets').select(); // ApiKey auth is used
```

### if default has been set to true in *signIn()* method *useAuth()* can be skipped
```javascript
ums.signIn({
  email: 'Elon@tesla.com',
  password: 'secret-password',
  default: true,
  auth: 'Elon Musk'
});
```

### Elon can create new rockets with his permissions without calling *useAuth()* method
```javascript
dom.dataset('rockets').insert([]); // Elon permissions will be used
```

### we can clearly indicate that we are going to use ApiKey auth
```javascript
dom.useAuth('basic access').dataset('rockets').select();
```

### or we can set default auth
```javascript
ums.setDefault('Elon Mask');  // after this all dataset calls without useAuth() will use Elon auth
```

### or reset to the ApiKey auth
```javascript
ums.resetDefault(); // Apikey auth is going to be default auth again
```

### We can create a new user
```javascript
ums.signUp({
  email: '',
  password: ''
}); /* Question - do we have authorized new user just after creation or we need to sign in? */
```

### Maybe, we will introduce activate method for UMS users in the future?
```javascript
ums.activate({
  token: 'token from the activation email',
});
```

### Get user by id
```javascript
ums.getUserById(userId); // -> return user or throw an error
```

### Change user password
```javascript
ums.changePassword({
  oldPassword: '', 
  newPassword: ''
});
```

### Delete user 
```javascript
ums.deleteUser();
```

