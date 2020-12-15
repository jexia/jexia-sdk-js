import * as Joi from "joi";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, dom, init } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("create record REST API", () => {

  beforeAll(async () => init());

  afterAll(async () => cleaning());

  it("create a record with one no required field should return proper record", (done) => {
    dom.dataset("test_dataset")
      .insert([{test_field: "name"}])
      .subscribe((result) => {
        joiAssert(result, Joi.array()
          .items(DatasetRecordSchema.append({
            test_field: Joi.string().valid("name").required(),
          }))
          .length(1),
        );

        done();
      }, (error) => done.fail(error));
  });

  it("create a several records should return array of created records", (done) => {
    dom.dataset("test_dataset")
      .insert([
        {test_field: "name1"},
        {test_field: "name2"},
        {test_field: "name3"},
      ])
      .subscribe((result) => {
        joiAssert(result, Joi.array()
          .items(DatasetRecordSchema.append({
            test_field: Joi.string().valid("name1", "name2", "name3").required(),
          }))
          .length(3),
        );

        done();
      }, (error) => done.fail(error));
  });

  it("should return array of records when creating a record with single object notation ",(done) => {
    dom.dataset("test_dataset")
      .insert({
        test_field: "name",
      })
      .subscribe((result) => {
        joiAssert(result, Joi.array()
          .items(DatasetRecordSchema.append({
            test_field: Joi.string().valid("name").required(),
          }))
          .length(1),
        );

        done();
      }, (error) => done.fail(error));
  });

  it("create a record without required field name should return an error", (done) => {
    dom.dataset("test_dataset")
      .insert([{ age: 32 }])
      .subscribe(
      (result) => done.fail(`successfully executed with result: ${result}`),
      (error: any) => {
        expect(error).toBeDefined();
        done();
      });
  });
});
