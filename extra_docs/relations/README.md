# Relations
All project resources can be related to each other and SDK supports inserting, fetching and attaching/detaching related
records.
Let's create a simple schema which will be used for all further examples:

![Relations schema](https://jexia.github.io/jexia-sdk-js/assets/relations-schema.png)

There are three datasets and two relations: **posts** has *one-2-many* relation to **comments** and **comments** has
*one-2-one* relation to **author** (remember that all management opearations, such as creating datasets, fields and
relations can be done with [Web Management Application](https://docs.jexia.com/getting-started/user-management/) only).

To make our datasets not so boring, we can also add a few fields:
```typescript
interface Author {
  email: string;
}
interface Comment {
  text: string;
  like: boolean;
  author: Author;
}
interface Post {
  title: string;
  message: string;
  comments: Comment[];
}
```
Pay your attention - **Post** includes **comments** field as an array, but **Comment** has an **author**
as a plain value. That's the difference between *one-2-many* and *one-2-one* relation types.

### [Insert data](#insert-data)
To insert related records just provide a nested array to the `.insert()` method:
```typescript
dom.dataset("posts")
  .insert([{
    title: "Relations with Jexia SDK",
    message: "A do like how Jexia SDK implements relations!",
    comments: [{
      text: "Me too!",
      like: true,
      author: { email: "customer@email.com" }
    }, {
      text: "Might've been a bit better :(",
      like: false,
      author: { email: "hater@yahoo.com" }
    }]
  }])
  .execute();
```

Notice that records should be inserted in appropriate order - the relation root must be insert root.
It's impossible to insert into **comment** dataset with post related to that comment (tree cannot grow upside down).
This example is not going to work:

```typescript
dom.dataset("comments")
  .insert([{
    text: "Me too!",
    like: true,
    posts: {
      title: "Relations with Jexia SDK",
      message: "A do like how Jexia SDK implements relations!"
    }
  }])
  .execute();
```

If you want to create a comment in the existent post, you need to use `.attach()`, see how to use it in
[Attach and detach records](#attach-and-detach-records).

Also look how we are using arrays for *one-2-many* **posts** -> **comments** relation and just an object
for the **comments** -> **author** *one-2-one* relation.

### [Fetching related records](#fetching-related-records)
By default, `.select()` operation does not include related resources. To make it doing that we need to use `.related()`
method:
```typescript
dom.dataset("posts")
  .select()
  .related("comments")
  .execute()
```

The result will be:
```typescript
[{
  id: ...
  created_at: ...
  updated_at: ...
  title: "Relations with Jexia SDK",
  message: "A do like how Jexia SDK implements relations!",
  comments: [{
    id: ...
    created_at: ...
    updated_at: ...
    text: "Me too!",
    like: true,
  }, {
    id: ...
    created_at: ...
    updated_at: ...
    text: "Might've been a bit better :(",
    like: false,
  }]
}]
```

We can also want to get not all fields but only few:
```typescript
dom.dataset("posts")
  .select()
  .related("comments", comments => comments.fields("text"))
  .execute()
```

Here is the result:
```typescript
[{
  id: ...
  created_at: ...
  updated_at: ...
  title: "Relations with Jexia SDK",
  message: "A do like how Jexia SDK implements relations!",
  comments: [{
    id: ...
    text: "Me too!",
  }, {
    id: ...
    text: "Might've been a bit better :(",
  }]
}]
```

Notice that `id` field will be always there. Nothing will be working without `id`!

What if we want to get an author of each comment? Simple, just use nested `.related()`:

```typescript
dom.dataset("posts")
  .select()
  .related("comments", comments => comments.related("author"))
  .execute()
```

Of course, you can use as many nested relations as you want and select any fields from any resource:
```typescript
dom.dataset("posts")
  .select()
  .related("comments", comments => comments
    .fields("text", "like")
    .related("author"), author => author
      .fields("email")
    )
  )
  .execute()
```

### [Attach and detach records](#attach-and-detach-records)

We have described how to insert parent and child records in one go, but eventually, we need to relate existent records
to other ones. You can do it using `.attach()` and `.detach()`.

Let's say you have inserted a post:

```typescript
  const posts = await dom.dataset("posts")
    .insert({
      title: "A post with no comments",
      message: "Okay",
    })
    .execute();

  console.log(posts);
  // output:
  // [
  //   {
  //     id: ...,
  //     title: "A post with no comments",
  //     message: "Okay",
  //   }
  // ]
```

Then some comments...

```typescript
  const comments = await dom.dataset("comments")
    .insert([
      {
        text: "Very nice, congrats!",
        like: true,
      },
      {
        text: "Might've been waaaay better",
        like: false,
      },
    ])
    .execute();

  console.log(comments);
  // output:
  // [
  //   { id: ..., text: "Very nice, congrats!", like: true },
  //   { id: ..., text: "Might've been waaaay better", like: false }
  // ]
```

Finally, you want to relate these with your post, so you call `.attach()` passing the name of the **resource** (that can
be either a **dataset** or a **fileset**) and filter criteria:

```typescript
  const [firstPost] = posts;
  const commentsIds = comments.map(comment => comment.id);

  await = dom.dataset("posts")
    .attach("comments", (field) => field("id").isInArray(commentsIds))
    .where((field) => field("id").isEqualTo(firstPost.id)) // required for both attach/detach, otherwise an error will be thrown
    .execute();

  // attach operation doesn't return any data, so we need to call .select()
  const postsWithComments = await dom.dataset("posts")
    .select()
    .related("comments")
    .execute();

  console.log(postsWithComments);

  // output:
  // [
  //   {
  //     id: ...,
  //     title: "A post with no comments",
  //     message: "Okay",
  //     comments: [
  //       { id: ..., text: "Very nice, congrats!", like: true },
  //       { id: ..., text: "Might've been waaaay better", like: false }
  //     ]
  //   }
  // ]

```

After attaching those comments, you feel regret, and you want to undo it. That's totally acceptable,
similar to `.attach()`, call `.detach()`:

```typescript
  await = dom.dataset("posts")
    .detach("comments", (field) => field("like").isEqualTo(false)) // detach comments with unlike from the post
    .where((field) => field("id").isEqualTo(firstPost.id))
    .execute();

  const postsWithNoUnlikeComments = await dom.dataset("posts")
    .select()
    .related("comments")
    .execute();

  console.log(postsWithNoUnlikeComments);

  // output:
  // [
  //   {
  //     id: ...,
  //     title: "A post with no comments",
  //     message: "Okay",
  //     comments: [
  //       { id: ..., text: "Very nice, congrats!", like: true }
  //     ]
  //   }
  // ]
```


### [Take advantage from the TS interfaces](#take-advantage-from-the-ts-interfaces)
We have created typescript interfaces for our datasets. Why? Well, it can give us some useful hints,
especially when we are working on a big, complex query. Let's see how it works.

All we need to do to turn on typescript magic it's just provide an interface when we are initializing a query:
```typescript
dom.dataset<Post>("posts")
  select()
  ...
```

Now we've got hint for the `.related()` method:
![Related hint](https://jexia.github.io/jexia-sdk-js/assets/relations-hints-1.png)

and hint for the nested fields:
![Related fields hint](https://jexia.github.io/jexia-sdk-js/assets/relations-hints-2.png)
