import * as faker from "faker";
import { CompositeFilteringCondition, FilteringCondition, LogicalOperator } from "./filteringCondition";

function createSubject({
  field = faker.random.words(1),
  operator = faker.helpers.randomize(["=", "!=", "like"]),
  value = faker.helpers.randomize([faker.random.words(), [faker.random.word()]]),
} = {}) {
  return {
    field,
    operator,
    value,
    subject: new FilteringCondition(field, operator, value),
  };
}

describe("FilteringCondition class", () => {
  let subject: FilteringCondition<string>;
  let field: string;
  let operator: string;
  let value: string | string[];

  beforeEach(() => {
    ({ field, operator, value, subject } = createSubject());
  });

  it("should have a default logical operator type of 'and'", () => {
    expect(subject.type).toBe("and");
  });

  describe("when compiling a simple condition", () => {
    it("compiles to the expected format ", () => {
      expect(subject.compile()).toEqual([{ field }, operator, value]);
    });
  });

  describe("when adding a condition with the AND/OR methods", () => {
    it("creates the proper CompositeFilteringCondition object when using OR", () => {
      const compCondition = subject.or(createSubject().subject);

      expect(compCondition instanceof CompositeFilteringCondition).toBeTruthy();
    });

    it("creates the proper CompositeFilteringCondition object when using AND", () => {
      const compCondition = subject.and(createSubject().subject);

      expect(compCondition instanceof CompositeFilteringCondition).toBeTruthy();
    });

    describe("when compiling", () => {
      it("returns the correct format when using the OR operator", () => {
        const {
          field: anotherField,
          operator: anotherOperator,
          value: anotherValue,
          subject: anotherSubject,
        } = createSubject();

        const compCondition = subject.or(anotherSubject);

        expect(compCondition.compile()).toEqual([
          { field }, operator, value,
          "or",
          { field: anotherField }, anotherOperator, anotherValue,
        ]);
      });

      it("returns the correct format when using the AND operator", () => {
        const {
          field: anotherField,
          operator: anotherOperator,
          value: anotherValue,
          subject: anotherSubject,
        } = createSubject();

        const compCondition = subject.and(anotherSubject);

        expect(compCondition.compile()).toEqual([
          { field }, operator, value,
          "and",
          { field: anotherField }, anotherOperator, anotherValue,
        ]);
      });
    });
  });
});

function createCompositeSubject({
  filtering = createSubject(),
  type = faker.helpers.randomize(["and", "or"]),
} = {}) {
  return {
    ...filtering,
    type,
    compositeSubject: new CompositeFilteringCondition(filtering.subject, (<LogicalOperator> type)),
  };
}

describe("CompositeFilteringCondition class", () => {

  it("should use the given logical operator type", () => {
    const { compositeSubject, type } = createCompositeSubject();
    expect(compositeSubject.type).toBe(type);
  });

  describe("when calling or()", () => {
    it("should not mutate condition", () => {
      const { compositeSubject } = createCompositeSubject();
      const { subject: condition } = createSubject();
      condition.type = "and";

      compositeSubject.or(condition);

      expect(condition.type).toEqual("and");
    });
  });

  describe("when compiling a condition", () => {
    it("should return expected format when there is only one", () => {
      const { compositeSubject, field, operator, value } = createCompositeSubject();

      expect(compositeSubject.compile()).toEqual([
        { field }, operator, value,
      ]);
    });

    it("should return expected format when using the OR operator", () => {
      const { compositeSubject, field, operator, value } = createCompositeSubject();
      const {
        field: anotherField,
        operator: anotherOperator,
        value: anotherValue,
        subject: anotherSubject,
      } = createSubject();

      const composite = compositeSubject.or(anotherSubject);

      expect(composite.compile()).toEqual([
        { field }, operator, value,
        "or",
        { field: anotherField }, anotherOperator, anotherValue,
      ]);
    });

    it("should return expected format when using the AND operator", () => {
      const { compositeSubject, field, operator, value } = createCompositeSubject();
      const {
        field: field2,
        operator: operator2,
        value: value2,
        subject,
      } = createSubject();

      const composite = compositeSubject.and(subject);

      expect(composite.compile()).toEqual([
        { field }, operator, value,
        "and",
        { field: field2 }, operator2, value2,
      ]);
    });

    it("should return expected format when using both OR/AND operators", () => {
      const { compositeSubject, field, operator, value } = createCompositeSubject();
      const {
        field: field2,
        operator: operator2,
        value: value2,
        subject: subject2,
      } = createSubject();
      const {
        field: field3,
        operator: operator3,
        value: value3,
        subject: subject3,
      } = createSubject();

      const composite = compositeSubject
        .or(subject2)
        .and(subject3);

      expect(composite.compile()).toEqual([
        { field }, operator, value,
        "or",
        { field: field2 }, operator2, value2,
        "and",
        { field: field3 }, operator3, value3,
      ]);
    });

    it("should return expected format when using both OR/AND operators", () => {
      const {
        field: field1,
        operator: operator1,
        value: value1,
        subject: subject1,
      } = createSubject();
      const {
        field: field2,
        operator: operator2,
        value: value2,
        subject: subject2,
      } = createSubject();

      const subject1OrSubject2 = subject1.or(subject2);

      const {
        field: field3,
        operator: operator3,
        value: value3,
        subject: subject3,
      } = createSubject();
      const {
        field: field4,
        operator: operator4,
        value: value4,
        subject: subject4,
      } = createSubject();

      const subject3OrSubject4 = subject3.or(subject4);

      const anotherComposite = subject1OrSubject2.and(subject3OrSubject4);

      expect(anotherComposite.compile()).toEqual([
        { field: field1 }, operator1, value1,
        "or",
        { field: field2 }, operator2, value2,
        "and",
        [
          { field: field3 }, operator3, value3,
          "or",
          { field: field4 }, operator4, value4,
        ],
      ]);
    });

  });
});
