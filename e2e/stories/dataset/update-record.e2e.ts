import * as faker from "faker";
import * as Joi from "joi";
import { switchMap } from "rxjs/operators";
import { Dataset, field } from "../../../src";
import { BackendErrorSchema } from "../../lib/common";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("update record REST API", () => {
  let dataset: Dataset;

  beforeAll(async () => {
    await init();
    dataset = dom.dataset(DEFAULT_DATASET.NAME);
  });

  afterAll(async () => cleaning());

  it("should return array of records when updating single record by id", (done) => {
    const newName = faker.lorem.sentence(3);

    dataset
      .insert({ [DEFAULT_DATASET.FIELD]: faker.name.findName() })
      .pipe(
        switchMap(([record]) => dataset
          .update({ [DEFAULT_DATASET.FIELD]: newName })
          .where(field("id").isEqualTo(record.id))
        ),
      )
      .subscribe((updateResult) => {
        joiAssert(updateResult, Joi.array()
          .items(DatasetRecordSchema.append({
            [DEFAULT_DATASET.FIELD]: Joi.string().valid(newName).required()
          }))
          .length(1),
        );
        done();
      },
        (error) => done.fail(error),
      );
  });

  it("should return array of records when updating single record by a field name", (done) => {
    const originalName = faker.name.findName();
    const randomField = faker.random.arrayElement(["some_field", "another_field", "last_field"]);
    const newRandomValue = faker.lorem.sentence(5);

    dataset
      .insert({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: faker.lorem.sentence(4),
      })
      .pipe(
        switchMap(() => dataset
          .update({
            [DEFAULT_DATASET.FIELD]: originalName,
            [randomField]: newRandomValue,
          })
          .where(field(DEFAULT_DATASET.FIELD).isEqualTo(originalName))),
      )
      .subscribe((updateResult) => {
        joiAssert(updateResult, Joi.array()
          .items(DatasetRecordSchema.append({
            [DEFAULT_DATASET.FIELD]: originalName,
            [randomField]: newRandomValue,
          }))
          .length(1));
        done();
      },
        (error) => done.fail(error),
      );
  });

  it("should throw error under invalid where condition", (done) => {
    const originalName = faker.name.findName();

    dataset
      .insert({ [DEFAULT_DATASET.FIELD]: originalName })
      .pipe(
        switchMap(() => dataset
          .update({ [DEFAULT_DATASET.FIELD]: faker.lorem.sentence(4) })
          .where(field("id").isEqualTo("invalid"))),
      )
      .subscribe(
        (result) => done.fail(`execute successfully with result ${result}`),
        (error) => {
          joiAssert(error, BackendErrorSchema);
          done();
        },
      );
  });

});
