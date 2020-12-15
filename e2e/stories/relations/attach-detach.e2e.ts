import * as faker from "faker";
import * as Joi from "joi";
// @ts-ignore
import * as joiAssert from "joi-assert";
import { BackendErrorSchema } from "../../lib/common";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, dom, initForRelations } from "../../teardowns";

jest.setTimeout(15000);

const fakePost = () => ({
  title: faker.lorem.sentence(),
  text: faker.lorem.lines(),
});
const fakeComment = () => ({
  message: faker.lorem.sentence(),
  like: faker.random.boolean(),
});
const fakeAuthor = () => ({ email: faker.internet.email() });

describe("Attach/detach related resources", () => {
  let firstPost: any;
  let secondPost: any;
  let firstComment: any;
  let secondComment: any;

  const isFirstComment = (field: any) => field("id").isEqualTo(firstComment.id);
  const isSecondComment = (field: any) => field("id").isEqualTo(secondComment.id);
  const isFirstPost = (field: any) => field("id").isEqualTo(firstPost.id);

  function deleteDataset(name: string, data: any[]) {
    return dom.dataset(name)
      .delete()
      .where((f) => f("id").isInArray(data.map((p) => p.id)))
      .toPromise();
  }

  beforeAll(async () => await initForRelations());
  afterAll(async () => await cleaning());

  describe("On attach", () => {
    let allPosts: any[];
    let allComments: any[];
    let allAuthors: any[];
    const postData = [ fakePost(), fakePost() ];
    const commentsData = [ fakeComment(), fakeComment() ];
    const authorsData = [ fakeAuthor(), fakeAuthor() ];

    beforeAll(async () => {
      allPosts = await dom.dataset("posts").insert(postData).toPromise();
      allComments = await dom.dataset("comments").insert(commentsData).toPromise();
      allAuthors = await dom.dataset("author").insert(authorsData).toPromise();
    });

    beforeAll(async () => {
      [firstPost, secondPost] = allPosts;
      [firstComment, secondComment] = allComments;
    });

    afterAll(async () => {
      await deleteDataset("posts", allPosts);
      await deleteDataset("comments", allComments);
      await deleteDataset("comments", allAuthors);
    });

    it("should attach resources using a filter", async () => {
      const [author] = authorsData;

      const [{ comments }] = await dom.dataset("posts")
        .select()
        .related("comments")
        .toPromise();

      joiAssert(comments, Joi.empty());

      // Attach comments to posts
      await dom.dataset("posts")
        .attach("comments", isFirstComment)
        .where(isFirstPost)
        .toPromise();

      // Attach author to comment
      await dom.dataset("comments")
        .attach("author", (field: any) => field("email").isEqualTo(author.email))
        .where(isFirstComment)
        .toPromise();

      const [post] = await dom.dataset("posts")
        .select()
        .related("comments", (c) => c.related("author"))
        .toPromise();

      const expectedPostSchema = DatasetRecordSchema.append({
        text: Joi.string().required().valid(firstPost.text),
        title: Joi.string().required().valid(firstPost.title),
        comments: Joi.array().items(
          DatasetRecordSchema.append({
            message: Joi.string().required().valid(firstComment.message),
            like: Joi.boolean().required().valid(firstComment.like),
            author: DatasetRecordSchema.append({
              email: Joi.string().email().required().valid(author.email),
            }),
          }),
        ).length(1),
      });

      joiAssert(post, expectedPostSchema);
    });

    describe("when not passing a condition", () => {
      it("should throw an error", async () => {
        try {
          await dom.dataset("posts")
            .attach("comments", isFirstComment)
            // missing where condition
            .toPromise();

          joiAssert(true, false, "should not reach this line");
        } catch (e) {
          joiAssert(e, BackendErrorSchema);
        }
      });
    });

    describe("When the cardinality is wrong", () => {
      it("should throw an error", async () => {
        try {
          const isAnyPost = (field: any) => field("id").isInArray(allPosts.map((p) => p.id));

          // trying to attach one comment to multiple posts
          await dom.dataset("posts")
            .attach("comments", isSecondComment)
            .where(isAnyPost)
            .toPromise();

          joiAssert(true, false, "should not reach this line");
        } catch (e) {
          joiAssert(e, BackendErrorSchema);
        }
      });
    });
  });

  describe("On detach", () => {
    const postsWithComments = [
      {
        ...fakePost(),
        comments: [ fakeComment() ],
      },
      {
        ...fakePost(),
        comments: [],
      },
    ];

    const [firstPostComment] = postsWithComments[0].comments;
    const commentsData = [ fakeComment() ];
    const isSecondPost = (f: any) => f("id").isEqualTo(secondPost.id);

    beforeAll(async () => {
      [firstPost, secondPost] = await dom.dataset("posts").insert(postsWithComments).toPromise();
      [firstComment] = await dom.dataset("comments").insert(commentsData).toPromise();
    });

    it("should detach resources inserted with nested notation", async () => {
      const [{ comments }] = await dom.dataset("posts")
        .select()
        .related("comments")
        .toPromise();

      const { id: firstPostCommentId } = comments[0];
      const expectedCommentsSchema = Joi.array()
        .items(
          DatasetRecordSchema.append({
            message: Joi.string().required().valid(firstPostComment.message),
            like: Joi.boolean().required().valid(firstPostComment.like),
          }),
        ).length(1);

      joiAssert(comments, expectedCommentsSchema);

      // Detach comments from first post
      await dom.dataset("posts")
        .detach("comments", (f) => f("id").isEqualTo(firstPostCommentId))
        .where(isFirstPost)
        .toPromise();

      const [post] = await dom.dataset("posts")
        .select()
        .related("comments")
        .toPromise();

      const expectedPostSchema = DatasetRecordSchema.append({
        text: Joi.string().required().valid(firstPost.text),
        title: Joi.string().required().valid(firstPost.title),
        comments: Joi.array().empty(),
      });

      joiAssert(post, expectedPostSchema);
    });

    it("should detach resources previously attached", async () => {
      // Attach comments to second post
      await dom.dataset("posts")
        .attach("comments", isFirstComment)
        .where(isSecondPost)
        .toPromise();

      // Detach comments from second post
      await dom.dataset("posts")
        .detach("comments", isFirstComment)
        .where(isSecondPost)
        .toPromise();

      const [post] = await dom.dataset("posts")
        .select()
        .related("comments")
        .toPromise();

      const expectedPostSchema = DatasetRecordSchema.append({
        text: Joi.string().required().valid(firstPost.text),
        title: Joi.string().required().valid(firstPost.title),
        comments: Joi.array().empty(),
      });

      joiAssert(post, expectedPostSchema);
    });

    describe("When trying to detach non-existing resources", () => {
      it("should throw error", async () => {
        try {
          // Detach comments from second post
          await dom.dataset("posts")
            .detach("comments", isFirstComment)
            .where(isSecondPost)
            .toPromise();

          joiAssert(true, false, "should not reach this line");
        } catch (e) {
          joiAssert(e, BackendErrorSchema);
        }
      });
    });
  });
});
