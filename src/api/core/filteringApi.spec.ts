// tslint:disable:no-string-literal
import * as faker from "faker";
import {
  combineCriteria,
  field,
  FieldFilter,
  FilteringCriterion,
  IFilteringCriterion,
} from "./filteringApi";
import { CompositeFilteringCondition, FilteringCondition } from "./filteringCondition";

describe("FieldFilter class", () => {
  function createSubject({
    fieldName = faker.random.word(),
  } = {}) {
    return {
      fieldName,
      subject: new FieldFilter<any>(fieldName),
    };
  }

  function testParams<T>({ operator, getCriterion, value }: {
    operator: string;
    value: T;
    getCriterion: (subject: FieldFilter<any>) => IFilteringCriterion<T>;
  }) {
    let filteringCondition: FilteringCondition<string>;
    let fieldName: string;
    let subject: FieldFilter<any>;

    beforeEach(() => {
      ({ subject, fieldName } = createSubject());

      const criterion: IFilteringCriterion<string> = getCriterion(subject);
      filteringCondition = criterion.condition as FilteringCondition<string>;
    });

    it("assigns proper field", () => {
      expect(filteringCondition.field).toEqual(fieldName);
    });

    it("assigns proper operator", () => {
      expect(filteringCondition.operator).toEqual(operator);
    });

    it("assigns proper value", () => {
      expect(filteringCondition.value).toEqual(value);
    });
  }

  describe("when building a filter", () => {

    describe("with greater than operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: ">",
        getCriterion: (subject) => subject.isGreaterThan(value),
      });
    });

    describe("with less than operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: "<",
        getCriterion: (subject) => subject.isLessThan(value),
      });
    });

    describe("with equal to operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: "=",
        getCriterion: (subject) => subject.isEqualTo(value),
      });
    });

    describe("with not equal to operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: "!=",
        getCriterion: (subject) => subject.isDifferentFrom(value),
      });
    });

    describe("with equal-or-more-than operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: ">=",
        getCriterion: (subject) => subject.isEqualOrGreaterThan(value),
      });
    });

    describe("with equal-or-less-than operator", () => {
      const value = faker.random.word();

      testParams({
        value,
        operator: "<=",
        getCriterion: (subject) => subject.isEqualOrLessThan(value),
      });
    });

    describe("with is null operator", () => {
      testParams({
        value: true,
        operator: "null",
        getCriterion: (subject) => subject.isNull(),
      });
    });

    describe("with is null operator", () => {
      testParams({
        value: false,
        operator: "null",
        getCriterion: (subject) => subject.isNotNull(),
      });
    });

    describe("with is-in operator", () => {
      const value = [faker.random.number(), faker.random.number()];
      testParams({
        value,
        operator: "in",
        getCriterion: (subject) => subject.isInArray(value),
      });
    });

    describe("with is-not-in operator", () => {
      const value = [faker.random.number(), faker.random.number()];
      testParams({
        value,
        operator: "not in",
        getCriterion: (subject) => subject.isNotInArray(value),
      });
    });

    describe("with like operator", () => {
      const value = faker.random.word();
      testParams({
        value,
        operator: "like",
        getCriterion: (subject) => subject.isLike(value),
      });
    });

    describe("with regex operator", () => {
      const value = faker.random.word();
      testParams({
        value,
        operator: "regex",
        getCriterion: (subject) => subject.satisfiesRegex(value),
      });
    });

    describe("with between operator", () => {
      const value = [faker.random.number(), faker.random.number()];
      const [start, end] = value;
      testParams({
        value,
        operator: "between",
        getCriterion: (subject) => subject.isBetween(start, end),
      });
    });

  });

});

describe("FilteringCriterion class", () => {
  interface ICriterionSubject {
    fieldName: string;
    operator: string;
    value: string;
    lowLevelCondition: FilteringCondition<any>;
    highLevelCriteria: any;
  }

  function createSubject({
    fieldName = faker.random.alphaNumeric(10),
    operator = faker.random.alphaNumeric(3),
    value = faker.random.word(),
    lowLevelCondition = new FilteringCondition(fieldName, operator, value),
    highLevelCriteria = null,
  }: Partial<ICriterionSubject> = {}) {
    return {
      fieldName,
      operator,
      value,
      lowLevelCondition,
      highLevelCriteria,
      subject: new FilteringCriterion(lowLevelCondition, highLevelCriteria),
    };
  }

  it("should throw an error when no condition is provided", () => {
    expect(() => {
      // tslint:disable
      new FilteringCriterion();
    }).toThrowError();
  });

  it("should assign the proper condition", () => {
    const { subject, lowLevelCondition } = createSubject();

    expect(subject.condition).toEqual(lowLevelCondition);
  });

  describe("for high level criteria", () => {
    it("should create an instance of CompositeFilteringCondition", () => {
      const highLevelCriteria = createSubject().subject;
      const { subject } = createSubject({
        highLevelCriteria,
      });

      expect(subject.condition).toBeInstanceOf(CompositeFilteringCondition);
    });

    it("should add the condition using AND operator", () => {
      const highLevelCriteria = createSubject().subject;
      const { subject } = createSubject({
        highLevelCriteria,
      });

      expect(subject.condition.type).toBe("and");
    });
  });

});

describe("when using field helper", () => {

  it("should return the proper instance", () => {
    const filter = field(faker.random.word());
    expect(filter).toBeInstanceOf(FieldFilter);
  });

  it("should assign the name to the filter", () => {
    const fieldName = faker.random.word();
    const filter = field(fieldName);

    expect(filter.fieldName).toBe(fieldName);
  });

});

describe("when combining criteria", () => {

  it("should combine with high level criteria", () => {
    const filter: any = field("name").isEqualTo("value");
    const condition: any = combineCriteria(filter);
    expect(condition["lowLevelCondition"]).toEqual(
      new CompositeFilteringCondition(filter["lowLevelCondition"], "and"));
  });

  it("should fail without parameter", () => {
    expect(() => combineCriteria(undefined as any)).toThrow();
  });

});
