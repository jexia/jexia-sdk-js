// tslint:disable:no-string-literal
import { combineCriteria, field, IFilteringCriterion } from "./filteringApi";
import { CompositeFilteringCondition } from "./filteringCondition";

describe("FieldFilter class", () => {
  describe("when building a filter with one condition and greater than operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isGreaterThan("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: ">", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and less than operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isLessThan("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "<", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and equal to operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isEqualTo("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "=", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and not equal to operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isDifferentFrom("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "<>", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and equal-or-more-than operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isEqualOrGreaterThan("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: ">=", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and equal-or-less-than operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isEqualOrLessThan("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "<=", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and is null operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isNull();
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "IS_NULL", values: [], type: "and" });
    });
  });
  describe("when building a filter with one condition and is null operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isNotNull();
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "IS_NOT_NULL", values: [ ], type: "and" });
    });
  });
  describe("when building a filter with one condition and is-in operator", () => {
    it("compiles to the proper JSON", () => {
      let values = ["1", "2", "3"];
      let filter: IFilteringCriterion = field("name").isInArray(values);
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "IN", values, type: "and" });
    });
  });
  describe("when building a filter with one condition and is-not-in operator", () => {
    it("compiles to the proper JSON", () => {
      let values = ["1", "2", "3"];
      let filter: IFilteringCriterion = field("name").isNotInArray(values);
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "NOT_IN", values, type: "and" });
    });
  });
  describe("when building a filter with one condition and between operator", () => {
    it("compiles to the proper JSON", () => {
      let start = "1";
      let end = "2";
      let filter: IFilteringCriterion = field("name").isBetween(start, end);
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "BETWEEN", values: [start, end], type: "and" });
    });
  });
  describe("when building a filter with one condition and like operator", () => {
    it("compiles to the proper JSON", () => {
      let filter: IFilteringCriterion = field("name").isLike("value");
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "LIKE", values: [ "value" ], type: "and" });
    });
  });
  describe("when building a filter with one condition and like operator", () => {
    it("compiles to the proper JSON", () => {
      let regexp = "regexp";
      let filter: IFilteringCriterion = field("name").satisfiesRegexp(regexp);
      let jsonResult: object = (filter as any).lowLevelCondition.compile();
      expect(jsonResult as any).toEqual({ field: "name", operator: "REGEXP", values: [ regexp ], type: "and" });
    });
  });
  describe("when building a filter with multiple conditions on a single nesting level", () => {
    it("compiles to the correct JSON", () => {
      let filter: IFilteringCriterion = field("field").isDifferentFrom("value")
                                          .and(field("field").isDifferentFrom("value2"))
                                          .or(field("field").isDifferentFrom("value3"));
      let result: object = (filter as any).lowLevelCondition.compile();
      let expected = { conditions: [
          { field: "field", operator: "<>", values: ["value"], type: "and" },
          { field: "field", operator: "<>", values: ["value2"], type: "and" },
          { field: "field", operator: "<>", values: ["value3"], type: "or" }],
        type: "and" };
      expect(result).toEqual(expected);
    });
  });
  describe("when building a filter with multiple conditions on two nesting levels", () => {
    it("compiles to the correct JSON", () => {
      let filter: IFilteringCriterion = field("field").isDifferentFrom("value")
                                          .and(field("field").isDifferentFrom("value2")
                                                .or(field("field").isDifferentFrom("value3")));
      let result: object = (filter as any).lowLevelCondition.compile();
      let expected = { conditions: [
          { field: "field", operator: "<>", values: ["value"], type: "and" },
          { conditions:
            [ { field: "field", operator: "<>", values: [ "value2" ], type: "and" },
              { field: "field", operator: "<>", values: [ "value3" ], type: "or" } ],
            type: "and" } ],
        type: "and" };
      expect(result).toEqual(expected);
    });
  });

  describe("when combining criteria", () => {

    it("should combine with high level criteria", () => {
      const filter: any = field("name").isEqualTo("value");
      const condition: any = combineCriteria(filter);
      expect(condition["lowLevelCondition"]).toEqual(
        new CompositeFilteringCondition(filter["lowLevelCondition"], "AND"));
    });

    it("should fail without parameter", () => {
      expect(() => combineCriteria(undefined as any)).toThrow();
    });

  });
});
