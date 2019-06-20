import * as faker from "faker";
import * as Joi from "joi";
// @ts-ignore
import * as joiAssert from "joi-assert";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, dom, initForRelations } from "../../teardowns";

jest.setTimeout(15000);

const testData = [{
  title: faker.lorem.sentence(),
  text: faker.lorem.lines(),
  comments: [{
    message: faker.lorem.sentence(),
    like: faker.random.boolean(),
    author: {
      email: faker.internet.email()
    }
  }]
}];

describe("Populate related fields", () => {
  beforeAll(async () => {
    await initForRelations();
    await dom.dataset("posts").insert(testData).execute();
  });
  afterAll(async () => await cleaning());

  it("should select all nested fields by default", async () => {
    const [{ comments }] = await dom.dataset("posts")
      .select()
      .related("comments")
      .execute();
    joiAssert(comments[0], DatasetRecordSchema.append({
      message: Joi.string().required(),
      like: Joi.boolean().required()
    }));
  });

  it("should select only provided fields and id", async () => {
    const [{ comments }] = await dom.dataset("posts")
      .select()
      .related("comments", (c) => c.fields("message"))
      .execute();

    joiAssert(comments[0], Joi.object({
      id: Joi.string().uuid().required(),
      message: Joi.string().required(),
    }));
  });

  it("should populate all fields from 2-nd level relation", async () => {
    const [{ comments }] = await dom.dataset("posts")
      .select()
      .related("comments", (c) => c.related("author"))
      .execute();

    joiAssert(comments[0].author, DatasetRecordSchema.append({
      email: Joi.string().required(),
    }));
  });

  it("should select only provided fields and id from the 2-nd level relation", async () => {
    const [{ comments }] = await dom.dataset("posts")
      .select()
      .related("comments",
        (c) => c.related("author",
          (author) => author.fields("email"))
      )
      .execute();

    joiAssert(comments[0].author, Joi.object({
      id: Joi.string().uuid().required(),
      email: Joi.string().required(),
    }));
  });

  it("should select only provided fields and id from both nested relations", async () => {
    const [{ comments }] = await dom.dataset("posts")
      .select()
      .related("comments",
        (c) => c
          .fields("message")
          .related("author",
            (author) => author.fields("email")
          )
      )
      .execute();

    joiAssert(comments[0], Joi.object({
      id: Joi.string().uuid().required(),
      message: Joi.string().required(),
      author: Joi.object({
        id: Joi.string().uuid().required(),
        email: Joi.string().required(),
      })
    }));
  });
});
