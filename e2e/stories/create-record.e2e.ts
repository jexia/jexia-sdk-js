import * as Joi from "joi";
import * as jexiaSDK from "../../src/node";
import { IAuthOptions, LogLevel } from "../../src/node";
import { DatasetRecordSchema } from "../lib/dataset";
import { Management } from "../management";

const jexiaClient = jexiaSDK.jexiaClient;
const dataOperations = jexiaSDK.dataOperations;

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

let dom = dataOperations();

const credentials: IAuthOptions = {
  projectID: process.env.E2E_PROJECT_ID as string,
  key: process.env.E2E_API_KEY as string,
  secret: process.env.E2E_API_SECRET as string
};

describe("create record REST API", () => {

  beforeAll(async () => {
    await jexiaClient().init(credentials, dom, new jexiaSDK.LoggerModule(LogLevel.DEBUG));

    const management = new Management();

    await management.login();

    // uncomment when there will be remove dataset API to clean up things after tests
    // await management.createDataset("test_dataset");

    /*await management.createDatasetField("name", {
      type: "string",
      validators: {
        required: false
      }
    });*/
  });

  it("create a record with one no required field should return proper record", async () => {
    const result = await dom.dataset("test_dataset")
      .insert([{name: "name"}])
      .execute();

    joiAssert(result, Joi.array()
      .items(DatasetRecordSchema.append({
        name: Joi.string().valid("name").required()
      }))
      .length(1)
    );
  });

  it("create a several records should return array of created records", async () => {
    const result = await dom.dataset("test_dataset")
      .insert([
        {name: "name1"},
        {name: "name2"},
        {name: "name3"}
      ])
      .execute();

    joiAssert(result, Joi.array()
      .items(DatasetRecordSchema.append({
        name: Joi.string().valid("name1", "name2", "name3").required()
      }))
      .length(3)
    );
  });

  /* TODO Activate this test when there will be a field remove API */
  it("create a record without required field name should return an error", async () => {
    let expected: any;
    const result = await dom.dataset("test_required")
      .insert([{ age: 32 }])
      .execute()
      .catch((error: any) => expected = error);

    expect(result).toBeUndefined();
    expect(expected).toBeDefined();
  });

});
