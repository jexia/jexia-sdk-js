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
  auth: 'Elon Musk' // set an alias for this authorization 
}); /* returns Promise which will contain user id */
```

### If User successfully signed in, his alias can be used to get access to the datasets
```javascript
dom.dataset('rockets', 'Elon Mask').select(); /* any operations that are allowed to Elon */
```

### User's email can be used as well as alias (or in case of alias wasn't provided)
```javascript
dom.dataset('rockets', 'Elon@tesla.com').select();
```

### without second argument ApiKey auth is used
```javascript
dom.dataset('rockets').select(); // ApiKey auth is used
```

### if default has been set to true in *signIn()* method, auth argument can be omitted
```javascript
ums.signIn({
  email: 'Elon@tesla.com',
  password: 'secret-password',
  default: true,
  auth: 'Elon Musk'
});
```

### Elon can create new rockets with his permissions by default
```javascript
dom.dataset('rockets').insert([]); // Elon permissions will be used
```

### we can clearly indicate that we are going to use ApiKey auth
```javascript
dom.dataset('rockets', 'basic access').select();
```

### or we can set default auth
```javascript
ums.setDefault('Elon Mask');  // after this all dataset calls without useAuth() will use Elon's auth
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

### Fetch user by auth alias (or email)
```javascript
ums.getUser('Elon Mask'); // -> return user or throw an error
```

### Change user password
```javascript
ums.changePassword('Elon@tesla.com', oldPassword, newPassword);
```

### Delete user 
```javascript
ums.deleteUser('Elon@tesla.com', password);
```

