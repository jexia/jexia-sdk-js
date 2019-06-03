import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../../src";
import { MESSAGE } from "../../../src/config/message";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

const joiAssert = Joi.assert;

jest.setTimeout(15000); // for the unstable internet connection

describe("delete record REST API", async () => {
  const getDataSet = () => dom.dataset(DEFAULT_DATASET.NAME);
  const BAD_REQUEST = new Error(`${MESSAGE.CORE.BACKEND_ERROR}400 Bad Request`);

  beforeAll(async () => init());

  afterAll(async () => cleaning());

  it("deletes single record by id", async () => {
    const [record] = await getDataSet()
      .insert({ [DEFAULT_DATASET.FIELD]: faker.name.findName() })
      .execute();

    const isRecord = field("id").isEqualTo(record.id);

    await getDataSet()
      .delete()
      .where(isRecord)
      .execute();

    const result = await getDataSet()
      .select()
      .where(isRecord)
      .execute();

    joiAssert(result, Joi.empty());
  });

  it("deletes multiples records", async () => {
    const records = await getDataSet()
      .insert([
        { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
        { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
      ])
      .execute();

    const isInList = field("id").isInArray(records.map((r) => r.id));

    await getDataSet()
      .delete()
      .where(isInList)
      .execute();

    const result = await getDataSet()
      .select()
      .where(isInList)
      .execute();

    joiAssert(result, Joi.empty());
  });

  it("should throw error under invalid where condition", async () => {
    try {
      await getDataSet()
        .delete()
        .where(field("id").isEqualTo(faker.random.uuid()))
        .execute();
    } catch (e) {
      joiAssert(e, BAD_REQUEST);
    }
  });

});
