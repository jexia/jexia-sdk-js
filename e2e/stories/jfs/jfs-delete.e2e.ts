import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../../src";
import { Fileset } from "../../../src/api/fileops/fileset";
import { BackendErrorSchema } from "../../lib/common";
import { cleaning, DEFAULT_DATASET, DEFAULT_FILESET, initWithJFS, jfs } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("delete record REST API", async () => {
  let fileset: Fileset<any, any, any, any>;

  beforeAll(async () => {
    await initWithJFS(DEFAULT_FILESET.NAME);
    fileset = jfs.fileset(DEFAULT_FILESET.NAME);
  });

  afterAll(async () => cleaning());

  it("deletes single record by id", async () => {
    const record = await fileset
      .upload([{
        data: { [DEFAULT_FILESET.FIELD]: faker.random.word() }
      }])
      .toPromise();

    const isRecord = field("id").isEqualTo(record.id);

    await fileset
      .delete()
      .where(isRecord)
      .execute();

    const result = fileset
      .select()
      .where(isRecord)
      .execute();

    joiAssert(result, Joi.empty());
  });

  describe("deletes multiples records", () => {
    let records: any[] = [];
    beforeAll((done) => {
      fileset
        .upload([
          { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
          { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
        ].map((data) => ({ data })))
        .subscribe((record) => records.push(record), done, done);
    });

    it("should delete all records by ids list", async () => {
      const isInList = field("id").isInArray(records.map(({ id }) => id));

      await fileset
        .delete()
        .where(isInList)
        .execute();

      const result = fileset
        .select()
        .where(isInList)
        .execute();

      joiAssert(result, Joi.empty());
    });
  });

  it("should throw error under invalid where condition", async () => {
    try {
      await fileset
        .delete()
        .where(field("id").isEqualTo(faker.random.uuid()))
        .execute();
    } catch (e) {
      joiAssert(e, BackendErrorSchema);
    }
  });

});
