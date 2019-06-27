import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../../src";
import { Fileset } from "../../../src/api/fileops/fileset";
import { FilesetRecordSchema } from "../../lib/fileset";
import { cleaning, DEFAULT_DATASET, DEFAULT_FILESET, initWithJFS, jfs } from "../../teardowns";
import { BAD_REQUEST_ERROR } from "./../../lib/utils";

const joiAssert = Joi.assert;

jest.setTimeout(15000); // for the unstable internet connection

describe("update record REST API", async () => {
  let fileset: Fileset<any, any, any, any>;

  beforeAll(async () => {
    await initWithJFS(DEFAULT_FILESET.NAME);
    fileset = jfs.fileset(DEFAULT_FILESET.NAME);
  });

  afterAll(async () => cleaning());

  it("should return array of records when updating single record by id", async () => {
    const newName = faker.lorem.sentence(3);

    const record = await fileset
      .upload([{
        data: { [DEFAULT_DATASET.FIELD]: faker.name.findName() }
      }])
      .toPromise();

    const updateResult = await fileset
      .update({ [DEFAULT_DATASET.FIELD]: newName })
      .where(field("id").isEqualTo(record.id))
      .execute();

    joiAssert(updateResult, Joi.array()
      .items(FilesetRecordSchema.append({
        [DEFAULT_DATASET.FIELD]: Joi.string().valid(newName).required()
      }))
      .length(1)
    );
  });

  it("should return array of records when updating single record by a field name", async () => {
    const originalName = faker.name.findName();
    const randomField = faker.random.arrayElement(["some_field", "another_field", "last_field"]);
    const newRandomValue = faker.lorem.sentence(5);

    await fileset
      .upload([ {
        data: {
          [DEFAULT_DATASET.FIELD]: originalName,
          [randomField]: faker.lorem.sentence(4)
        },
      }])
      .toPromise();

    const updateResult = await fileset
      .update({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: newRandomValue,
      })
      .where(field(DEFAULT_DATASET.FIELD).isEqualTo(originalName))
      .execute();

    joiAssert(updateResult, Joi.array()
      .items(FilesetRecordSchema.append({
        [DEFAULT_DATASET.FIELD]: originalName,
        [randomField]: newRandomValue,
      }))
      .length(1)
    );
  });

  it("should throw error under invalid where condition", async () => {
    const originalName = faker.name.findName();

    await fileset
      .upload([{ data: { [DEFAULT_DATASET.FIELD]: originalName } }])
      .toPromise();

    try {
      await fileset
        .update({ [DEFAULT_DATASET.FIELD]: faker.lorem.sentence(4) })
        .where(field("id").isEqualTo("invalid"))
        .execute();
    } catch (e) {
      joiAssert(e, BAD_REQUEST_ERROR);
    }
  });

});
