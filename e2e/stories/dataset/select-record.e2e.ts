import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../../src";
import { IFilteringCriterion, IFilteringCriterionCallback } from "../../../src/api/core/filteringApi";
import { Dataset } from "../../../src/api/dataops/dataset";
import { BackendErrorSchema } from "../../lib/common";
import { DatasetRecordSchema } from "../../lib/dataset";
import { cleaning, DEFAULT_DATASET, dom, init, ErrorLoggerModule } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for unstable internet connection

describe("filter records REST API", () => {
  let dataset: Dataset<any>;

  const FIELD = {
    BOOLEAN: "boolean_field",
    INTEGER: "integer_field",
    FLOAT: "float_field",
    STRING: "string_field",
    DATE: "date_field",
    DATETIME: "datetime_field",
  };
  type Condition = IFilteringCriterion<any> | IFilteringCriterionCallback<any>;

  const RecordSchema = Joi.object().keys({
    id: Joi.string().required(),
  });

  function testLength(title: string, condition: Condition, expectedLength: number) {
    it(`should select records by "${title}"`, (done) => {
      dataset
        .select()
        .where(condition)
        .subscribe(selectResult => {
          joiAssert(selectResult, Joi.array().length(expectedLength));
          done();
        }, done.fail);
    });
  }

  // @ts-ignore
  function testError(title: string, condition: Condition) {
    it(`should throw error when selecting records by "${title}"`, (done) => {
      dataset
          .select()
          .where(condition)
          .subscribe(
            (result) => done.fail("proceeded successfully with result: "
              + JSON.stringify(result)),
            (error: any) => {
              joiAssert(error, BackendErrorSchema);
              done();
            }
          );
    });
  }

  function setupData(testData: any[]) {
    beforeAll((done) => {
      dataset
        .insert(testData)
        .subscribe(() => done());
    });

    afterAll((done) => {
      dataset
        .delete()
        .where(field("id").isNotNull())
        .subscribe(() => done());
    });
  }

  function test(
    testData: any[],
    successTests: Array<{title: string, condition: Condition, expectedLength: number}>,
    failTests: Array<{title: string, condition: Condition}>) {

    setupData(testData);

    successTests.forEach(({ title, condition, expectedLength }) => {
      testLength(title, condition, expectedLength);
    });

    /* TODO Incorrect condition does not throw an error anymore
     * disable until it will be fixed
    failTests.forEach(({ title, condition }) => {
      testError(title, condition);
    });
     */
  }

  beforeAll(async () => {
    await init(
      DEFAULT_DATASET.NAME,
      [
        { name: FIELD.BOOLEAN, type: "boolean" },
        { name: FIELD.INTEGER, type: "integer" },
        { name: FIELD.FLOAT, type: "float" },
        { name: FIELD.STRING, type: "string" },
        { name: FIELD.DATE, type: "date" },
        { name: FIELD.DATETIME, type: "datetime" },
      ],
      [dom, ErrorLoggerModule],
    );
    dataset = dom.dataset(DEFAULT_DATASET.NAME);
  });

  afterAll(async () => cleaning());

  describe("when filtering boolean types", () => {
    const fieldName = FIELD.BOOLEAN;

    const successTests = [
      {
        title: "isEqualTo",
        condition: field(fieldName).isEqualTo(true),
        expectedLength: 2,
      },
      {
        title: "isDifferentFrom",
        condition: field(fieldName).isDifferentFrom(true),
        expectedLength: 2,
      },
      {
        title: "isInArray",
        condition: field(fieldName).isInArray([false]),
        expectedLength: 1,
      },
      {
        title: "isNotInArray",
        condition: field(fieldName).isNotInArray([false]),
        expectedLength: 2, // doesn't include null values
      },
      {
        title: "isNull",
        condition: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        condition: field(fieldName).isNotNull(),
        expectedLength: 3,
      },
    ];

    const failTests = [
      {
        title: "isGreaterThan",
        condition: field(fieldName).isGreaterThan(true),
      },
      {
        title: "isLessThan",
        condition: field(fieldName).isLessThan(true),
      },
      {
        title: "isEqualOrGreaterThan",
        condition: field(fieldName).isEqualOrGreaterThan(false),
      },
      {
        title: "isEqualOrLessThan",
        condition: field(fieldName).isEqualOrLessThan(true),
      },
      {
        title: "isLike",
        condition: field(fieldName).isLike("true"),
      },
      {
        title: "isBetween",
        condition: field(fieldName).isBetween(true, false),
      },
    ];

    const testData = [
      { [fieldName]: null },
      { [fieldName]: true },
      { [fieldName]: true },
      { [fieldName]: false },
    ];

    test(testData, successTests, failTests);
  });

  describe("when filtering integer types", () => {
    const fieldName = FIELD.INTEGER;

    const successTests = [
      {
        title: "isEqualTo",
        condition: field(fieldName).isEqualTo(1),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        condition: field(fieldName).isDifferentFrom(2),
        expectedLength: 4,
      },
      {
        title: "isGreaterThan",
        condition: field(fieldName).isGreaterThan(1),
        expectedLength: 3,
      },
      {
        title: "isLessThan",
        condition: field(fieldName).isLessThan(2),
        expectedLength: 1,
      },
      {
        title: "isEqualOrGreaterThan",
        condition: field(fieldName).isEqualOrGreaterThan(1),
        expectedLength: 4,
      },
      {
        title: "isEqualOrLessThan",
        condition: field(fieldName).isEqualOrLessThan(3),
        expectedLength: 3,
      },
      {
        title: "isBetween",
        condition: field(fieldName).isBetween(2, 4),
        expectedLength: 3,
      },
      {
        title: "isInArray",
        condition: field(fieldName).isInArray([2, 4]),
        expectedLength: 2,
      },
      {
        title: "isNotInArray",
        condition: field(fieldName).isNotInArray([2, 4]),
        expectedLength: 2, // doesn't include null values
      },
      {
        title: "isNull",
        condition: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        condition: field(fieldName).isNotNull(),
        expectedLength: 4,
      },
    ];

    const failTests = [
      {
        title: "isLike",
        condition: field(fieldName).isLike("1"),
      },
    ];

    const testData = [
      { [fieldName]: null },
      { [fieldName]: 1 },
      { [fieldName]: 2 },
      { [fieldName]: 3 },
      { [fieldName]: 4 },
    ];

    test(testData, successTests, failTests);
  });

  describe("when filtering float types", () => {
    const fieldName = FIELD.FLOAT;

    const successTests = [
      {
        title: "isEqualTo",
        condition: field(fieldName).isEqualTo(6.7),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        condition: field(fieldName).isDifferentFrom(6.7),
        expectedLength: 4,
      },
      {
        title: "isGreaterThan",
        condition: field(fieldName).isGreaterThan(2.0),
        expectedLength: 3,
      },
      {
        title: "isLessThan",
        condition: field(fieldName).isLessThan(6),
        expectedLength: 3,
      },
      {
        title: "isEqualOrGreaterThan",
        condition: field(fieldName).isEqualOrGreaterThan(4.6),
        expectedLength: 2,
      },
      {
        title: "isEqualOrLessThan",
        condition: field(fieldName).isEqualOrLessThan(2.4),
        expectedLength: 2,
      },
      {
        title: "isBetween",
        condition: field(fieldName).isBetween(1, 3),
        expectedLength: 2,
      },
      {
        title: "isNull",
        condition: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        condition: field(fieldName).isNotNull(),
        expectedLength: 4,
      },
    ];

    const failTests = [
      {
        title: "isLike",
        condition: field(fieldName).isLike("1"),
      },
    ];

    const testData = [
      { [fieldName]: null },
      { [fieldName]: 1.5 },
      { [fieldName]: 2.4 },
      { [fieldName]: 4.6 },
      { [fieldName]: 6.7 },
    ];

    test(testData, successTests, failTests);
  });

  describe("when filtering string types", () => {
    const fieldName = FIELD.STRING;

    const successTests = [
      {
        title: "isEqualTo",
        condition: field(fieldName).isEqualTo("1st"),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        condition: field(fieldName).isDifferentFrom("1st"),
        expectedLength: 4,
      },
      {
        title: "isLike",
        condition: field(fieldName).isLike("%th"),
        expectedLength: 1,
      },
      {
        title: "isInArray",
        condition: field(fieldName).isInArray(["3rd", "4th"]),
        expectedLength: 2,
      },
      {
        title: "isNotInArray",
        condition: field(fieldName).isNotInArray(["3rd", "4th"]),
        expectedLength: 2, // doesn't include null values
      },
      {
        title: "isNull",
        condition: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        condition: field(fieldName).isNotNull(),
        expectedLength: 4,
      },
    ];

    const failTests = [
      {
        title: "isGreaterThan",
        condition: field(fieldName).isGreaterThan("1"),
      },
      {
        title: "isEqualOrGreaterThan",
        condition: field(fieldName).isEqualOrGreaterThan("1"),
      },
      {
        title: "isLessThan",
        condition: field(fieldName).isLessThan("4"),
      },
      {
        title: "isEqualOrLessThan",
        condition: field(fieldName).isEqualOrLessThan("4"),
      },
      {
        title: "isBetween",
        condition: field(fieldName).isBetween("1", "4"),
      },
    ];

    const testData = [
      { [fieldName]: null },
      { [fieldName]: "1st" },
      { [fieldName]: "2nd" },
      { [fieldName]: "3rd" },
      { [fieldName]: "4th" },
    ];

    test(testData, successTests, failTests);
  });

  describe("when filtering date related types", () => {
    type MinMax = { min: number, max: number };
    const fakeNumber = (options: MinMax) => faker.random.number(options);
    const fakePastDatetime = (yearsAgo: MinMax) => faker.date.past(fakeNumber(yearsAgo)).toISOString();
    const fakeFutureDatetime = (yearsFromNow: MinMax) => faker.date.future(fakeNumber(yearsFromNow)).toISOString();

    function testDate({
      fieldName,
      fakePastDate,
      fakeFutureDate,
    }: any) {
      const testData = [
        { [fieldName]: null },
        { [fieldName]: fakePastDate({ min: 11, max: 30 }) },
        { [fieldName]: fakePastDate({ min: 0, max: 10 }) },
        { [fieldName]: fakeFutureDate({ min: 0, max: 10 }) },
        { [fieldName]: fakeFutureDate({ min: 11, max: 30 }) },
      ];

      const [nullDate, firstDate, secondDate, thirdDate, lastDate] = testData.map((t) => t[fieldName]);

      const successTests = [
        {
          title: "isEqualTo",
          condition: field(fieldName).isEqualTo(secondDate),
          validValues: [secondDate],
        },
        {
          title: "isDifferentFrom",
          condition: field(fieldName).isDifferentFrom(firstDate),
          validValues: [nullDate, secondDate, thirdDate, lastDate],
        },
        {
          title: "isInArray",
          condition: field(fieldName).isInArray([firstDate, secondDate]),
          validValues: [firstDate, secondDate],
        },
        {
          title: "isNotInArray",
          condition: field(fieldName).isNotInArray([thirdDate, lastDate]),
          validValues: [firstDate, secondDate], // doesn't include null values
        },
        {
          title: "isNull",
          condition: field(fieldName).isNull(),
          validValues: [nullDate],
        },
        {
          title: "isNotNull",
          condition: field(fieldName).isNotNull(),
          validValues: [firstDate, secondDate, thirdDate, lastDate],
        },
        {
          title: "isBetween",
          condition: field(fieldName).isBetween(firstDate, thirdDate),
          validValues: [firstDate, secondDate, thirdDate],
        },
        {
          title: "isLessThan",
          condition: field(fieldName).isLessThan(secondDate),
          validValues: [firstDate],
        },
        {
          title: "isGreaterThan",
          condition: field(fieldName).isGreaterThan(secondDate),
          validValues: [thirdDate, lastDate],
        },
        {
          title: "isEqualOrLessThan",
          condition: field(fieldName).isEqualOrLessThan(secondDate),
          validValues: [firstDate, secondDate],
        },
        {
          title: "isEqualOrGreaterThan",
          condition: field(fieldName).isEqualOrGreaterThan(secondDate),
          validValues: [secondDate, thirdDate, lastDate],
        },
      ];

      // @ts-ignore
      const failTests = [
        {
          title: "isLike",
          condition: field(fieldName).isLike(lastDate),
        },
      ];

      setupData(testData);

      successTests.forEach(({ title, condition, validValues }) => {
        it(`should select records by "${title}"`, (done) => {
          dataset
            .select()
            .fields(fieldName)
            .where(condition)
            .subscribe(selectResult => {
              /* Make date field to be Date object since ISO format difference
               2022-03-22T10:21:59.470Z ==> 2022-03-22T10:21:59.47Z
              */
              const result = selectResult.map((record) => {
                record[fieldName] = new Date(record[fieldName]);
                return record;
              });

              const expectedResult = Joi
                .array()
                .items(RecordSchema.append({
                  [fieldName]: Joi.date().valid(validValues.map((d) => new Date(d))),
                }))
                .length(validValues.length);

              joiAssert(result, expectedResult);

              done();
            })
        });
      });

      /* TODO Does not fail any more
       * find out
      failTests.forEach(({ title, condition }) => {
        testError(title, condition);
      });
       */
    }

    describe("Date", () => {
      const fieldName = FIELD.DATE;
      const fakePastDate = (yearsAgo: MinMax) => fakePastDatetime(yearsAgo).split("T")[0];
      const fakeFutureDate = (yearsFromNow: MinMax) => fakeFutureDatetime(yearsFromNow).split("T")[0];

      testDate({ fieldName, fakePastDate, fakeFutureDate });
    });

    describe("Datetime", () => {
      testDate({
        fieldName: FIELD.DATETIME,
        fakePastDate: fakePastDatetime,
        fakeFutureDate: fakeFutureDatetime,
      });
    });
  });

  describe("when setting range", () => {
    const testData = [
      { [FIELD.STRING]: "1st" },
      { [FIELD.STRING]: "2nd" },
      { [FIELD.STRING]: "3rd" },
      { [FIELD.STRING]: "4th" },
      { [FIELD.STRING]: "5th" },
      { [FIELD.STRING]: "6th" },
    ];

    // init beforeAll/AfterAll hooks
    setupData(testData);

    it("should return less items when limit is lower than total of results", (done) => {
      dataset
        .select()
        .limit(2)
        .subscribe(result => {
          joiAssert(result, Joi.array().length(2));
          done();
        }, done.fail);
    });

    it("should return all items when limit is higher than total of results", (done) => {
      dataset
        .select()
        .limit(10)
        .subscribe(result => {
          joiAssert(result, Joi.array().length(testData.length));
          done();
        }, done.fail);
    });

    it(`should split results when setting limit/offset`, (done) => {
      const limit = 2;
      dataset
        .select()
        .limit(limit)
        .offset(1)
        .subscribe(result => {
          const expectedSchema = Joi
            .array()
            .items(DatasetRecordSchema.append({
              [FIELD.STRING]: Joi.string().valid("2nd", "3rd"),
              [FIELD.BOOLEAN]: Joi.empty(),
              [FIELD.INTEGER]: Joi.empty(),
              [FIELD.FLOAT]: Joi.empty(),
              [FIELD.STRING]: Joi.empty(),
              [FIELD.DATE]: Joi.empty(),
              [FIELD.DATETIME]: Joi.empty(),
            }))
            .length(limit);

          joiAssert(result, expectedSchema);
          done();
        }, done.fail);
    });
  });

  describe("when sorting", () => {
    const testData = Array.from(
      { length: 5 },
      (v, index) => ({
        [FIELD.STRING]: faker.name.findName(),
        [FIELD.INTEGER]: faker.random.number({ min: index }),
      })
    );
    let sortField: string;

    // init beforeAll/AfterAll hooks
    setupData(testData);

    function byFieldAsc(a: any, b: any) {
      if (a[sortField] > b[sortField]) { return 1; }
      if (a[sortField] < b[sortField]) { return -1; }
      return 0;
    }

    function byFieldDesc(a: any, b: any) {
      if (a[sortField] < b[sortField]) { return 1; }
      if (a[sortField] > b[sortField]) { return -1; }
      return 0;
    }

    function testSorting(fn: "sortAsc" | "sortDesc", sortFn: (a: any, b: any) => number, done: () => void) {
      sortField = faker.random.arrayElement([FIELD.STRING, FIELD.INTEGER]);

      dataset
        .select()
        [fn](sortField)
        .subscribe(result => {
          const orderedSchemas = testData
            .slice(0) // copy array
            .sort(sortFn)
            .map((record) => ({
              [FIELD.STRING]: Joi.string().equal(record[FIELD.STRING]),
              [FIELD.BOOLEAN]: Joi.empty(),
              [FIELD.INTEGER]: Joi.number().integer().equal(record[FIELD.INTEGER]),
              [FIELD.FLOAT]: Joi.empty(),
              [FIELD.STRING]: Joi.empty(),
              [FIELD.DATE]: Joi.empty(),
              [FIELD.DATETIME]: Joi.empty(),
            }))
            .map((schema) => DatasetRecordSchema.append(schema));

          const expectedSchema = Joi
            .array()
            .ordered(...orderedSchemas);

          joiAssert(result, expectedSchema);
          done();
        });
    }

    it("should return ascending sorted results", (done) => {
      testSorting("sortAsc", byFieldAsc, done);
    });

    it("should return descending sorted results", (done) => {
      testSorting("sortDesc", byFieldDesc, done);
    });

  });

});
