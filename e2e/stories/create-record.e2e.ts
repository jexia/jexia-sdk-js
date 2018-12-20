import * as Joi from "joi";
import * as jexiaSDK from "../../src/node";
import { LogLevel } from "../../src/node";
import { DatasetRecordSchema } from "../lib/dataset";
import { Management } from "../management";

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

let dom = dataOperations();

describe("create record REST API", () => {
  const management = new Management();
  let dataset: { name: string, id: string };
  let apiKey: { id: string, key: string, secret: string };
  let policy: { id: string };

  beforeAll(async () => {

    await management.login();

    dataset = await management.createDataset("test_dataset");

    await management.createDatasetField(dataset.id, "test_field", {
      type: "string",
      validators: {
        required: true
      }
    });

    apiKey = await management.createApiKey();
    policy = await management.createPolicy(dataset, apiKey);

    await jexiaClient().init({
      projectID: process.env.E2E_PROJECT_ID as string,
      key: apiKey.key,
      secret: apiKey.secret,
    }, dom, new jexiaSDK.LoggerModule(LogLevel.DEBUG));
  });

  afterAll(async () => {
    await management.deleteDataset(dataset.id);
    await management.deleteApiKey(apiKey.key);
    await management.deletePolicy(policy.id);
  });

  it("create a record with one no required field should return proper record", async () => {
    const result = await dom.dataset(dataset.name)
      .insert([{test_field: "name"}])
      .execute();

    joiAssert(result, Joi.array()
      .items(DatasetRecordSchema.append({
        test_field: Joi.string().valid("name").required()
      }))
      .length(1)
    );
  });

  it("create a several records should return array of created records", async () => {
    const result = await dom.dataset(dataset.name)
      .insert([
        {test_field: "name1"},
        {test_field: "name2"},
        {test_field: "name3"}
      ])
      .execute();

    joiAssert(result, Joi.array()
      .items(DatasetRecordSchema.append({
        test_field: Joi.string().valid("name1", "name2", "name3").required()
      }))
      .length(3)
    );
  });

  it("create a record without required field name should return an error", async () => {
    let expected: any;
    await dom.dataset("test_required")
      .insert([{ age: 32 }])
      .execute()
      .catch((error: any) => expected = error);

    expect(expected).toBeDefined();
  });

});
