import * as faker from "faker";
import * as Joi from "joi";
import { Dataset } from "../../../src/api/dataops/dataset";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

jest.setTimeout(15000); // for unstable internet connection

describe("output record fields REST API", () => {
  let dataset: Dataset<any>;

  const FIELD = {
    TITLE: "title",
    AUTHOR: "author",
    COMMENTS: "comments",
  };

  const USER_SCHEMA = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  const SCHEMAS = {
    [FIELD.TITLE]: Joi.string(),
    [FIELD.AUTHOR]: USER_SCHEMA,
    [FIELD.COMMENTS]: Joi.array().items(Joi.object({
      title: Joi.string().required(),
      user: USER_SCHEMA,
    })),
  };

  const fakeUser = () => ({
    name: faker.name.findName(),
    email: faker.internet.email(),
  });

  const fakeComments = () => Array.from(
    { length: faker.random.number({ min: 1, max: 5 }) },
    () => ({
      title: faker.lorem.sentence(5),
      user: fakeUser(),
    })
  );

  const testData = Array.from(
    { length: 5 },
    () => ({
      [FIELD.TITLE]: faker.name.findName(),
      [FIELD.AUTHOR]: fakeUser(),
      [FIELD.COMMENTS]: fakeComments(),
    })
  );

  beforeAll(async () => {
    await init(
      DEFAULT_DATASET.NAME,
      [
        { name: FIELD.TITLE, type: "string" },
        { name: FIELD.AUTHOR, type: "json" },
        { name: FIELD.COMMENTS, type: "json" },
      ],
    );
    dataset = dom.dataset(DEFAULT_DATASET.NAME);
    await dataset
      .insert(testData)
      .toPromise();
  });

  afterAll(async () => cleaning());

  it("should return only id and the field passed", (done) => {
    const fieldName = faker.random.arrayElement([FIELD.TITLE, FIELD.AUTHOR, FIELD.COMMENTS]);

    dataset
      .select()
      .fields(fieldName)
      .subscribe((result) => {

        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [fieldName]: SCHEMAS[fieldName],
          })
          .length(testData.length);

        Joi.assert(result, expectedSchema);

        done();
      }, (error) => done.fail(error));
  });

  it("should return id + all fields passed", (done) => {
    dataset
      .select()
      .fields([FIELD.TITLE, FIELD.AUTHOR])
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [FIELD.TITLE]: SCHEMAS[FIELD.TITLE],
            [FIELD.AUTHOR]: SCHEMAS[FIELD.AUTHOR],
          });

        Joi.assert(result, expectedSchema);

        done();
      }, (error) => done.fail(error));
  });

  it("should return id + nested fields passed", (done) => {
    const userName = `${FIELD.AUTHOR}.name`;
    const userEmail = `${FIELD.AUTHOR}.email`;

    dataset
      .select()
      .fields(userName, userEmail)
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [userName]: Joi.string().required(),
            [userEmail]: Joi.string().email().required(),
          });

        Joi.assert(result, expectedSchema);
        done();
      });
  });

  it("should return field provided to the select method", (done) => {
    const fieldName = faker.random.arrayElement(Object.values(FIELD));

    dataset
      .select(fieldName)
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [fieldName]: SCHEMAS[fieldName],
          })
          .length(testData.length);

        Joi.assert(result, expectedSchema);

        done();
      }, (error) => done.fail(error));
  });

  it("should return id + all fields passed to the select method", (done) => {
    dataset
      .select(FIELD.TITLE, FIELD.AUTHOR)
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [FIELD.TITLE]: SCHEMAS[FIELD.TITLE],
            [FIELD.AUTHOR]: SCHEMAS[FIELD.AUTHOR],
          });

        Joi.assert(result, expectedSchema);

        done();
      }, (error) => done.fail(error));
  });

  it("should return id + nested fields passed to the select method", (done) => {
    const userName = `${FIELD.AUTHOR}.name`;
    const userEmail = `${FIELD.AUTHOR}.email`;

    dataset
      .select(userName, userEmail)
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [userName]: Joi.string().required(),
            [userEmail]: Joi.string().email().required(),
          });

        Joi.assert(result, expectedSchema);
        done();
      });
  });

  it("should return fields passed to the select and to the fields methods", (done) => {
    dataset
      .select(FIELD.AUTHOR, FIELD.TITLE)
      .fields(FIELD.AUTHOR, FIELD.COMMENTS)
      .subscribe((result) => {
        const expectedSchema = Joi
          .array()
          .items({
            id: Joi.string().uuid().required(),
            [FIELD.AUTHOR]: SCHEMAS[FIELD.AUTHOR],
            [FIELD.TITLE]: SCHEMAS[FIELD.TITLE],
            [FIELD.COMMENTS]: SCHEMAS[FIELD.COMMENTS],
          });

        Joi.assert(result, expectedSchema);
        done();
      });
  });
});
