import * as faker from "faker";
import * as Joi from "joi";
import { Dataset } from "../../../src/api/dataops/dataset";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for unstable internet connection

describe("output record fields REST API", () => {
  let dataset: Dataset<any>;

  const FIELD = {
    TITLE: "title",
    AUTHOR: "author",
    COMMENTS: "comments",
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
      [FIELD.COMMENTS]: JSON.stringify(fakeComments()),
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
      .execute();
  });

  afterAll(async () => cleaning());

  it("should return only id and the field passed", async () => {
    const fieldName = faker.random.arrayElement([FIELD.TITLE, FIELD.AUTHOR, FIELD.COMMENTS]);
    const result = await dataset
      .select()
      .fields(fieldName)
      .execute();

    const validValues = testData.map((r) => r[fieldName]);

    const expectedSchema = Joi
      .array()
      .items({
        id: Joi.string().uuid().required(),
        [fieldName]: Joi.valid(validValues).required(),
      })
      .length(testData.length);

    joiAssert(result, expectedSchema);
  });

  it("should return id + all fields passed", async () => {
    const result = await dataset
      .select()
      .fields([FIELD.TITLE, FIELD.AUTHOR])
      .execute();

    const expectedSchema = Joi
      .array()
      .items({
        id: Joi.string().uuid().required(),
        [FIELD.TITLE]: Joi.string().required(),
        [FIELD.AUTHOR]: Joi.object().required(),
      });

    joiAssert(result, expectedSchema);
  });

  it("should return id + nested fields passed", async () => {
    const userName = `${FIELD.AUTHOR}.name`;
    const userEmail = `${FIELD.AUTHOR}.email`;

    const result = await dataset
      .select()
      .fields(userName, userEmail)
      .execute();

    const expectedSchema = Joi
      .array()
      .items({
        id: Joi.string().uuid().required(),
        [userName]: Joi.string().required(),
        [userEmail]: Joi.string().email().required(),
      });

    joiAssert(result, expectedSchema);
  });

});
