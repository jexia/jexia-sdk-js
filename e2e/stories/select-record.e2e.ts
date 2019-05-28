import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../src";
import { cleaning, DEFAULT_DATASET, dom, init } from "../teardowns";
import { IFilteringCriterion } from "./../../dist/api/dataops/filteringApi";
import { MESSAGE } from "./../../src/config/message";

const joiAssert = Joi.assert;

jest.setTimeout(15000); // for unstable internet connection

describe("filter records REST API", async () => {
  let dataset;
  const BAD_REQUEST = new Error(`${MESSAGE.CORE.BACKEND_ERROR}400 Bad Request`);

  const FIELD = {
    BOOLEAN: "boolean_field",
    INTEGER: "integer_field",
    FLOAT: "float_field",
    STRING: "string_field",
  };

  function testLength(title: string, condition: IFilteringCriterion, expectedLength: number) {
    it(`should select records by "${title}"`, async () => {
      const selectResult = await dataset
        .select()
        .where(condition)
        .execute();

      joiAssert(selectResult, Joi.array().length(expectedLength));
    });
  }

  function testError(title: string, condition) {
    it(`should throw error when selecting records by "${title}"`, async () => {
      try {
        await dataset
          .select()
          .where(condition)
          .execute();
      } catch (e) {
        joiAssert(e, BAD_REQUEST);
      }
    });
  }

  function test(testData, successTests, failTests) {
    beforeAll(async () => {
      await dataset
        .insert(testData)
        .execute();
    });

    afterAll(async () => {
      await dataset
        .delete()
        .execute();
    });

    successTests.forEach(({ title, condition, expectedLength }) => {
      testLength(title, condition, expectedLength);
    });

    failTests.forEach(({ title, condition }) => {
      testError(title, condition);
    });
  }

  beforeAll(async () => {
    await init(
      DEFAULT_DATASET.NAME,
      [
        { name: FIELD.BOOLEAN, type: "boolean" },
        { name: FIELD.INTEGER, type: "integer" },
        { name: FIELD.FLOAT, type: "float" },
        { name: FIELD.STRING, type: "string" },
      ],
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
        expectedLength: 1,
      },
      {
        title: "isInArray",
        condition: field(fieldName).isInArray([false]),
        expectedLength: 1,
      },
      {
        title: "isNotInArray",
        condition: field(fieldName).isNotInArray([false]),
        expectedLength: 3,
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
        expectedLength: 3,
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

    const testData = [{ [fieldName]: null },
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
        expectedLength: 3,
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
        expectedLength: 3,
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
        condition: field(fieldName).isNotInArray(["4rd", "4th"]),
        expectedLength: 3,
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

});