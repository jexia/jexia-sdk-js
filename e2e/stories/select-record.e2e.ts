import * as faker from "faker";
import * as Joi from "joi";
import { field } from "../../src";
import { cleaning, DEFAULT_DATASET, dom, init } from "../teardowns";
import { MESSAGE } from "./../../src/config/message";

const joiAssert = Joi.assert;

jest.setTimeout(15000); // for unstable internet connection

describe("filter records REST API", async () => {
  const getDataSet = () => dom.dataset(DEFAULT_DATASET.NAME);
  const BAD_REQUEST = new Error(`${MESSAGE.CORE.BACKEND_ERROR}400 Bad Request`);

  const FIELD = {
    BOOLEAN: "boolean_field",
    INTEGER: "integer_field",
    FLOAT: "float_field",
    STRING: "string_field",
  };

  function testLength(title: string, where, expectedLength: number) {
    it(`should select records by "${title}"`, async () => {
      const selectResult = await getDataSet()
        .select()
        .where(where)
        .execute();

      joiAssert(selectResult, Joi.array().length(expectedLength));
    });
  }

  function testError(title: string, where) {
    it(`should throw error when selecting records by "${title}"`, async () => {
      try {
        await getDataSet()
          .select()
          .where(where)
          .execute();
      } catch (e) {
        joiAssert(e, BAD_REQUEST);
      }
    });
  }

  function test(successTests, failTests) {
    successTests.forEach(({ title, where, expectedLength }) => {
      testLength(title, where, expectedLength);
    });

    failTests.forEach(({ title, where }) => {
      testError(title, where);
    });
  }

  beforeAll(async () => init(
    DEFAULT_DATASET.NAME,
    [
      { name: FIELD.BOOLEAN, type: "boolean" },
      { name: FIELD.INTEGER, type: "integer" },
      { name: FIELD.FLOAT, type: "float" },
      { name: FIELD.STRING, type: "string" },
    ],
  ));

  afterAll(async () => cleaning());

  describe("when filtering boolean types", () => {
    const fieldName = FIELD.BOOLEAN;

    const successTests = [
      {
        title: "isEqualTo",
        where: field(fieldName).isEqualTo(true),
        expectedLength: 2,
      },
      {
        title: "isDifferentFrom",
        where: field(fieldName).isDifferentFrom(true),
        expectedLength: 1,
      },
      {
        title: "isInArray",
        where: field(fieldName).isInArray([false]),
        expectedLength: 1,
      },
      {
        title: "isNotInArray",
        where: field(fieldName).isNotInArray([false]),
        expectedLength: 3,
      },
      {
        title: "isNull",
        where: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        where: field(fieldName).isNotNull(),
        expectedLength: 3,
      },
    ];

    const failTests = [
      {
        title: "isGreaterThan",
        where: field(fieldName).isGreaterThan(true),
      },
      {
        title: "isLessThan",
        where: field(fieldName).isLessThan(true),
      },
      {
        title: "isEqualOrGreaterThan",
        where: field(fieldName).isEqualOrGreaterThan(false),
      },
      {
        title: "isEqualOrLessThan",
        where: field(fieldName).isEqualOrLessThan(true),
      },
      {
        title: "isLike",
        where: field(fieldName).isLike("true"),
      },
      {
        title: "isBetween",
        where: field(fieldName).isBetween(true, false),
      },
    ];

    beforeAll(async () => {
      await getDataSet()
        .insert([
          { [fieldName]: null },
          { [fieldName]: true },
          { [fieldName]: true },
          { [fieldName]: false },
        ])
        .execute();
    });

    test(successTests, failTests);
  });

  describe("when filtering integer types", () => {
    const fieldName = FIELD.INTEGER;

    const successTests = [
      {
        title: "isEqualTo",
        where: field(fieldName).isEqualTo(1),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        where: field(fieldName).isDifferentFrom(2),
        expectedLength: 4,
      },
      {
        title: "isGreaterThan",
        where: field(fieldName).isGreaterThan(1),
        expectedLength: 3,
      },
      {
        title: "isLessThan",
        where: field(fieldName).isLessThan(2),
        expectedLength: 1,
      },
      {
        title: "isEqualOrGreaterThan",
        where: field(fieldName).isEqualOrGreaterThan(1),
        expectedLength: 4,
      },
      {
        title: "isEqualOrLessThan",
        where: field(fieldName).isEqualOrLessThan(3),
        expectedLength: 3,
      },
      {
        title: "isBetween",
        where: field(fieldName).isBetween(1, 4),
        expectedLength: 2,
      },
      {
        title: "isNull",
        where: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        where: field(fieldName).isNotNull(),
        expectedLength: 4,
      },
    ];

    const failTests = [
      {
        title: "isLike",
        where: field(fieldName).isLike("1"),
      },
    ];

    beforeAll(async () => {
      await getDataSet()
        .insert([
          { [fieldName]: null },
          { [fieldName]: 1 },
          { [fieldName]: 2 },
          { [fieldName]: 3 },
          { [fieldName]: 4 },
        ])
        .execute();
    });

    test(successTests, failTests);
  });

  describe("when filtering float types", () => {
    const fieldName = FIELD.FLOAT;

    const successTests = [
      {
        title: "isEqualTo",
        where: field(fieldName).isEqualTo(6.7),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        where: field(fieldName).isDifferentFrom(6.7),
        expectedLength: 4,
      },
      {
        title: "isGreaterThan",
        where: field(fieldName).isGreaterThan(2.0),
        expectedLength: 3,
      },
      {
        title: "isLessThan",
        where: field(fieldName).isLessThan(6),
        expectedLength: 3,
      },
      {
        title: "isEqualOrGreaterThan",
        where: field(fieldName).isEqualOrGreaterThan(4.6),
        expectedLength: 2,
      },
      {
        title: "isEqualOrLessThan",
        where: field(fieldName).isEqualOrLessThan(2.4),
        expectedLength: 2,
      },
      {
        title: "isBetween",
        where: field(fieldName).isBetween(1, 2),
        expectedLength: 2,
      },
      {
        title: "isNull",
        where: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        where: field(fieldName).isNotNull(),
        expectedLength: 4,
      },
    ];

    const failTests = [
      {
        title: "isLike",
        where: field(fieldName).isLike("1"),
      },
    ];

    beforeAll(async () => {
      await getDataSet()
        .insert([
          { [fieldName]: null },
          { [fieldName]: 1.5 },
          { [fieldName]: 2.4 },
          { [fieldName]: 4.6 },
          { [fieldName]: 6.7 },
        ])
        .execute();
    });

    test(successTests, failTests);
  });

  describe("when filtering string types", () => {
    const fieldName = FIELD.STRING;

    const successTests = [
      {
        title: "isEqualTo",
        where: field(fieldName).isEqualTo("1st"),
        expectedLength: 1,
      },
      {
        title: "isDifferentFrom",
        where: field(fieldName).isDifferentFrom("1st"),
        expectedLength: 4,
      },
      {
        title: "isLike",
        where: field(fieldName).isLike("th"),
        expectedLength: 1,
      },
      {
        title: "isInArray",
        where: field(fieldName).isInArray(["3rd", "4th"]),
        expectedLength: 2,
      },
      {
        title: "isNotInArray",
        where: field(fieldName).isNotInArray(["4rd", "4th"]),
        expectedLength: 3,
      },
      {
        title: "isNull",
        where: field(fieldName).isNull(),
        expectedLength: 1,
      },
      {
        title: "isNotNull",
        where: field(fieldName).isNotNull(),
        expectedLength: 3,
      },
    ];

    const failTests = [
      {
        title: "isGreaterThan",
        where: field(fieldName).isGreaterThan("1"),
      },
      {
        title: "isEqualOrGreaterThan",
        where: field(fieldName).isEqualOrGreaterThan("1"),
      },
      {
        title: "isLessThan",
        where: field(fieldName).isLessThan("4"),
      },
      {
        title: "isEqualOrLessThan",
        where: field(fieldName).isEqualOrLessThan("4"),
      },
      {
        title: "isBetween",
        where: field(fieldName).isBetween("1", "4"),
      },
    ];

    beforeAll(async () => {
      await getDataSet()
        .insert([
          { [fieldName]: null },
          { [fieldName]: "1st" },
          { [fieldName]: "2nd" },
          { [fieldName]: "3rd" },
          { [fieldName]: "4th" },
        ])
        .execute();
    });

    test(successTests, failTests);

  });

});
