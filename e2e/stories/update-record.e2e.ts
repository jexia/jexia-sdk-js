import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../src";
import { DatasetRecordSchema } from "../lib/dataset";
import { cleaning, DEFAULT_DATASET, dom, init } from "../teardowns";
import { MESSAGE } from './../../src/config/message';

const joiAssert = Joi.assert;

jest.setTimeout(15000); // for the unstable internet connection

describe("update record REST API", async () => {
  const getDataSet = () => dom.dataset(DEFAULT_DATASET.NAME);
  const BAD_REQUEST = new Error(`${MESSAGE.CORE.BACKEND_ERROR}400 Bad Request`);

  beforeAll(async () => init());

  afterAll(async () => cleaning());

  it("updates single record by id", async () => {
    const newName = faker.lorem.sentence(3);

    const [record] = await getDataSet()
      .insert({ [DEFAULT_DATASET.FIELD]: faker.name.findName() })
      .execute();

    const updateResult = await getDataSet()
      .update({ [DEFAULT_DATASET.FIELD]: newName })
      .where(field("id").isEqualTo(record.id))
      .execute();

    joiAssert(updateResult, Joi.array()
      .items(DatasetRecordSchema.append({
        [DEFAULT_DATASET.FIELD]: Joi.string().valid(newName).required()
      }))
      .length(1)
    );
  });

  it("updates single record by a field name", async () => {
    const originalName = faker.name.findName();
    const randomField = faker.random.arrayElement(["some_field", "another_field", "last_field"]);
    const newRandomValue = faker.lorem.sentence(5);

    await getDataSet()
      .insert({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: faker.lorem.sentence(4),
      })
      .execute();

    const updateResult = await getDataSet()
      .update({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: newRandomValue,
      })
      .where(field(DEFAULT_DATASET.FIELD).isEqualTo(originalName))
      .execute();

    joiAssert(updateResult, Joi.array()
      .items(DatasetRecordSchema.append({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: newRandomValue,
      }))
      .length(1)
    );
  });

  it("should throw error under invalid where condition", async () => {
    const originalName = faker.name.findName();

    await getDataSet()
      .insert({ [DEFAULT_DATASET.FIELD]: originalName })
      .execute();

    try {
      await getDataSet()
        .update({ [DEFAULT_DATASET.FIELD]: faker.lorem.sentence(4) })
        .where(field("id").isEqualTo("invalid"))
        .execute();
    } catch (e) {
      joiAssert(e, BAD_REQUEST);
    }
  });

});
