## Jexia Fileset Module (JFS)

JFS is used for the upload, fetch and manipulate files as any other data. 
Before uploading any file you need to create a fileset using web management application (WebApp).
You can also set AWS bucket and credentials so that your files will be automatically uploaded to the 
Amazon storage.

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

If you already set up a fileset, you are able to upload files:

```typescript
jfs.fileset('my_awesome_fileset').upload(files)
  .subscribe(status => {
    /* status: {
      id: string; // id of the file
      status: 'loading' | 'loaded' | 'error'; // status of loading 
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

### Select files

It's possible to query filesets in the same way as datasets, file records will be returned

```typescript
const files = await jfs.fileset('my_awesome_fileset')
  .select('name', 'url')
  .where(field => field('size').isGreaterThan(1024000))
  .execute();

// array of files that fit to the condition will be returned
// files === [{ name: 'file1.jpj', url: 'https://...' }, {...}, ...]
```

### Update files

Update fileset in the same way as dataset. Updating a fileset record with new file is impossible ATM

```typescript
await jfs.fileset('my_awesome_fileset')
  .update({ 'name': 'newFileName' })
  .where(field => field('name').isEqualTo('oldFileName'))
  .execute();
```

### Delete a file
```typescript
await jfs.fileset('my_awesome_fileset')
  .delete()
  .where(field => field('size').isGreaterThan(1024000))
  .execute();
```


