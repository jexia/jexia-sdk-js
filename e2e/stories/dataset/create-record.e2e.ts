import * as Joi from "joi";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, dom, init } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("create record REST API", async () => {

  beforeAll(async () => init());

  afterAll(async () => cleaning());

  it("create a record with one no required field should return proper record", async () => {
    const result = await dom.dataset("test_dataset")
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
    const result = await dom.dataset("test_dataset")
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

  it("should return array of records when creating a record with single object notation ", async () => {
    const result = await dom.dataset("test_dataset")
      .insert({
        test_field: "name",
      })
      .execute();

    joiAssert(result, Joi.array()
      .items(DatasetRecordSchema.append({
        test_field: Joi.string().valid("name").required()
      }))
      .length(1)
    );
  });

  it("create a record without required field name should return an error", async () => {
    let expected: any;
    await dom.dataset("test_dataset")
      .insert([{ age: 32 }])
      .execute()
      .catch((error: any) => expected = error);

    expect(expected).toBeDefined();
  });

});
