import { BackendErrorSchema } from "../../lib/common";
import { ISetField } from "../../management";
import { cleaning, DEFAULT_DATASET, dom, init } from "../../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

const fields: ISetField[] = [{
  name: "required_field",
  type: "string",
  constraints: [{ type: "required" }]
}, {
  name: "numeric_field",
  type: "string",
  constraints: [{ type: "numeric" }]
}, {
  name: "alpha_field",
  type: "string",
  constraints: [{ type: "alpha" }]
}, {
  name: "alphanumeric_field",
  type: "string",
  constraints: [{ type: "alphanumeric" }]
}, {
  name: "uppercase_field",
  type: "string",
  constraints: [{ type: "uppercase" }]
}, {
  name: "lowercase_field",
  type: "string",
  constraints: [{ type: "lowercase" }]
}, {
  name: "length_field",
  type: "string",
  constraints: [{ type: "min_length", value: 10 }, { type: "max_length", value: 100 }]
}, {
  name: "range_field",
  type: "integer",
  constraints: [{ type: "min", value: 10 }, { type: "max", value: 100 }]
}, {
  name: "regexp_field",
  type: "string",
  constraints: [{ type: "regexp", value: "^[0-9]{2}-[A-Za-z]{5}$" }]
}];

const tests: {[key: string]: any} = {
  numeric_field: {
    valid_value: "12345",
    invalid_value: "has letters",
    message: "Validation error: field \"numeric_field\" violates \"numeric\" constraint",
  },
  alpha_field: {
    valid_value: "does not have numbers",
    invalid_value: "has number 100",
    message: "Validation error: field \"alpha_field\" violates \"alpha\" constraint",
  },
  alphanumeric_field: {
    valid_value: "has letters and number 100",
    invalid_value: "has symbols - !_#",
    message: "Validation error: field \"alphanumeric_field\" violates \"alphanumeric\" constraint",
  },
  uppercase_field: {
    valid_value: "ALL LETTERS IN UPPERCASE",
    invalid_value: "Has Lowercase letters",
    message: "Validation error: field \"uppercase_field\" violates \"uppercase\" constraint",
  },
  lowercase_field: {
    valid_value: "has only lowercase letters",
    invalid_value: "has letters IN UPPERCASE",
    message: "Validation error: field \"lowercase_field\" violates \"lowercase\" constraint",
  },
  length_field: {
    valid_value: "has from 10 to 100 string length",
    invalid_value: "2short",
    message: "Validation error: field \"length_field\" violates \"minLength\" constraint",
  },
  range_field: {
    valid_value: 20,
    invalid_value: 110,
    message: "Validation error: field \"range_field\" violates \"max\" constraint",
  },
  regexp_field: {
    valid_value: "01-Valid",
    invalid_value: "invalid value",
    message: "Validation error: field \"regexp_field\" violates \"regexp\" constraint",
  }
};

describe("Dataset field validations", () => {

  beforeAll(async () => init(DEFAULT_DATASET.NAME, fields));

  afterAll(async () => cleaning());

  describe("validation for required field", () => {
    let validationError: any;

    beforeAll(async () => await dom.dataset(DEFAULT_DATASET.NAME)
      .insert([{ field: "test" }, { field: "test" }])
      .execute()
      .catch((error: any) => validationError = error));

    it("should reject promise with the correct error if value is not provided", () => {
      joiAssert(validationError, BackendErrorSchema);
    });

    it("should have correct http code and status", () => {
      expect(validationError.httpStatus).toEqual({ code: 400, status: "Bad Request" });
    });

    it("should have correct message", () => {
      expect(validationError.message).toEqual("validation error: missing data for \"required_field\"");
    });

  });

  for (let fieldName of Object.keys(tests)) {

    describe(`validation for ${fieldName}`, () => {
      let validationError: any;

      beforeAll(async () => await dom.dataset(DEFAULT_DATASET.NAME)
        .insert([{ required_field: "data", [fieldName]: tests[fieldName].invalid_value } ])
        .execute()
        .catch((error: any) => validationError = error));

      it("should reject promise with the correct error if value violates validation", () => {
        expect(validationError).toBeDefined();
        joiAssert(validationError, BackendErrorSchema);
      });

      it("should have correct http code and status", () => {
        expect(validationError.httpStatus).toEqual({ code: 400, status: "Bad Request" });
      });

      it("should have correct message", () => {
        expect(validationError.message).toEqual(tests[fieldName].message);
      });
    });
  }

});
