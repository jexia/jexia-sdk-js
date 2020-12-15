import * as faker from "faker";
import * as Joi from "joi";
import { switchMap, tap } from "rxjs/operators";
import { field, IFilteringCriterion } from "../../../src";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";
import { BAD_REQUEST_ERROR } from "./../../lib/utils";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("delete record REST API", () => {
  const getDataSet = () => dom.dataset(DEFAULT_DATASET.NAME);

  beforeAll(async () => init());

  afterAll(async () => cleaning());

  it("deletes single record by id", (done) => {
    let isRecord: IFilteringCriterion;

    getDataSet()
      .insert({ [DEFAULT_DATASET.FIELD]: faker.name.findName() })
      .pipe(
        tap(([record]) => isRecord = field("id").isEqualTo(record.id)),
        switchMap(() => getDataSet().delete().where(isRecord)),
        switchMap(() => getDataSet().select().where(isRecord)),
      )
      .subscribe((result) => {
        joiAssert(result, Joi.empty());
        done();
      }, (error) => done.fail(error));
  });

  it("deletes multiples records",(done) => {
    let isInList: IFilteringCriterion;

    getDataSet()
      .insert([
        { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
        { [DEFAULT_DATASET.FIELD]: faker.name.findName() },
      ])
      .pipe(
        tap((records) => isInList = field("id").isInArray(records.map(({ id }) => id))),
        switchMap(() => getDataSet().delete().where(isInList)),
        switchMap(() => getDataSet().select().where(isInList)),
      )
      .subscribe((result) => {
        joiAssert(result, Joi.empty());
        done();
      }, (error) => done.fail(error));
  });

  /* TODO Does not throw an error anymore but returns an empty value instead */
  xit("should throw error under invalid where condition", (done) => {
    getDataSet()
      .delete()
      .where(field("id").isEqualTo(faker.random.uuid()))
      .subscribe(
        (result) => done.fail(`executed successfully with result ${result}`),
        (error) => {
          joiAssert(error, BAD_REQUEST_ERROR);
          done();
        },
      );
  });
});
