## Jexia Fileset Module (JFS)

JFS is using for the upload, fetch and manipulate files as any other data. 

### Initialize 
```typescript
import { jexiaClient, fileOperations } from 'jexia-sdk-js';

const jfs = fileOperations();

jexiaClient().init({
  projectID: 'your-project-id',
  key: 'your-project-key',
  secret: 'your-project-secret'
}, jfs);
```

### Upload a file to the fileset
Before uploading any file you need to create a fileset using web management application (WebApp).
You can also set AWS bucket and credentials so that your files will be automatically uploaded to the 
Amazon storage.
If you already set up a fileset, you are able to upload files:
```typescript

jfs.fileset('my_awesome_fileset').upload(files)
  .subscribe(status => {
    /* status: {
      id: string; // id of the file
      status: 'loading' | 'loaded' | 'error'; // status of loading 
      progress: number; // percent of file loaded
      message: string; // error message 
    */
  }, error => {
    /* error: global upload error
    * does not happen when some file causes an error
    * */
  }, completed => {
    // this is called when all loading processes finished
  });
```



