# Jexia Fileset Module (JFS)

JFS is used for the uploading, fetching and manipulating files as any other user data. Basically, fileset has the same 
functionality as dataset, but provides a way to maintain large data objects (files).  
Before uploading any file you need to manually create a fileset with web management application 
[app.jexia.com](https://app.jexia.com).
You can also set AWS bucket and credentials so that your files will be automatically uploaded to the Amazon storage.

### [Initialize](#init) 
To use fileset features, just add fileOperations module to the client initialization. Notice, that for Node.js
you have to import fileOperations from *jexia-sdk-js/node*, but if you running your application in browser you need to
use *jexia-sdk-js/browser* path. It's because file format is different under these two platforms.
```typescript
import { jexiaClient, fileOperations } from 'jexia-sdk-js/node'; // 'jexia-sdk-js/browser' for browser applications

const jfs = fileOperations();

jexiaClient().init({
  projectID: 'your-project-id',
  key: 'your-project-key',
  secret: 'your-project-secret'
}, jfs);
```

### [Configure module](#configure)
You can pass a config object to the `fileOperation()` function:
```typescript
const jfs = fileOperations({
  /* Use RTC module to subscribe for the fileset events and wait until file
     will be successfully uploaded. Needs RTC module to be activated
     default: false */
  subscribeForTheFileUploading: boolean
  /* Timeout for uploading files
     default: 120000 */
  uploadTimeout: number
});
```

### [Files format](#format)
Under Node.js `jfs` accepts [read stream](#https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_class_fs_readstream), 
which can be created with **fs.createReadStream(path)**. 
```js
const fs = require('fs');
const record = {
  file: fs.createReadStream('../assets/logo.png')
}
```
In browser you need to pass **Blob** returned by **\<input type='file'\>** (part of HTML5 File Api).
```js
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', event => {
  const record = {
    file: event.target.files[0]
  }
}
```

### [Custom fileset fields](#custom-fields)
You can also send any additional fields alongside with a file and they will be stored in a fileset. 
Just use `data` property:
```typescript
const record = {
  data: {
    description: 'Main company logo',
    useByDefault: true
  },
  file
}
```

### [Upload a file to the fileset](#upload)
If you already set up a fileset, you are able to upload files. One or multiple files can be uploaded at once. `upload()` 
returns an observable and you need to call `subscribe()` to start uploading process. Each uploaded file will emit a 
*fileRecord*, which contains *id* and *status*. of uploaded file.
```typescript
jfs.fileset('my_awesome_fileset').upload([
  record1, record2, ...
]).subscribe(fileRecord => {
   console.log(fileRecord);
   /* output:
   { id: '11a12f17-8367-4114-a588-ae98a6cb3cda',
      created_at: '2019-05-24T07:17:37.325882Z',
      updated_at: '2019-05-24T07:17:37.325882Z',
      name: null,
      size: null,
      type: null,
      url: null,
      status: 'in_progress' }
    */
});
```

### [File upload status](#status)
After you upload a file you will receive file status. Status displays the progress of file uploading. 
Possible values are: 

- `in_progress` 
- `completed`
- `failed` 

 The first status you will get in response from `upload()` is `in_progress` (if you did not set true to the 
`subscribeForTheFileUploading` config property). It means that file record has been created and currently file is 
uploading to the persistent storage (whether AWS bucket or something else). 
There are two ways to track further file status changes - you can subscribe to the fileset changes with 
`realTimeModule` or you can set `subscribeForTheFileUploading` config option and SDK subscribes to that 
status automatically.

Use `realTimeModule`:
```typescript
import { jexiaClient, fileOperations, realTime } from 'jexia-sdk-js';

const jfs = fileOperations();

jexiaClient().init({
  projectID: 'your-project-id',
  key: 'your-project-key',
  secret: 'your-project-secret'
}, jfs, realTime());

const fileset = jfs.fileset('my_awesome_fileset');

fileset.upload(record).pipe(
  concatMap(fileRecord => fileset.watch().pipe(
    filter(event => event.data[0].id === fileRecord.id),
    takeWhile(event => event.data[0].status !== 'completed', true),
    map(event => {
      fileRecord.status = event.data[0].status;
      return fileRecord;
    })
  ))
).subscribe();
```
As you can see, there are some details you should take care of: filtering events by record id (`watch()` returns 
all events from the fileset), unsubscribing from watch observable with `takeWhile`. Better to use the next option.

Use `subscribeForTheFileUploading` config property (notice that you still need to activate realTimeModule):
```typescript
import { jexiaClient, fileOperations, realTime } from 'jexia-sdk-js';

const jfs = fileOperations({
  subscribeForTheFileUploading: true    
});

jexiaClient().init({
  projectID: 'your-project-id',
  key: 'your-project-key',
  secret: 'your-project-secret'
}, jfs, realTime());

const fileset = jfs.fileset('my_awesome_fileset');

fileset.upload(record).subscribe(fileRecord => {
  console.log(fileRecord);
  /* output:
    { id: '11a12f17-8367-4114-a588-ae98a6cb3cda',
      created_at: '2019-05-24T07:17:37.325882Z',
      updated_at: '2019-05-24T07:18:40.455764Z',
      name: 'logo.png',
      size: 42341,
      type: 'png',
      url: 'https://...',
      status: 'completed' }
  */
});
```

### [Fileset CRUD operations](#crud)
It's possible to query filesets in the same way as datasets, file records will be returned
```typescript
const files = await jfs.fileset('my_awesome_fileset')
  .select('name', 'url')
  .where(field => field('size').isGreaterThan(1024000))
  .execute();

// array of files that fit to the condition will be returned
// files === [{ name: 'file1.jpj', url: 'https://...' }, {...}, ...]
```
Update fileset in the same way as dataset. Updating a fileset record with new file is impossible ATM

```typescript
await jfs.fileset('my_awesome_fileset')
  .update({ 'name': 'newFileName' })
  .where(field => field('name').isEqualTo('oldFileName'))
  .execute();
```
and delete records:
```typescript
await jfs.fileset('my_awesome_fileset')
  .delete()
  .where(field => field('size').isGreaterThan(1024000))
  .execute();
```


