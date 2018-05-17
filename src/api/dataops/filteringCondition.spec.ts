import { CompositeFilteringCondition, FilteringCondition } from "./filteringCondition";

describe("FilteringCondition class", () => {

  it("should have a default logical operator type of 'and'", () => {
    const condition = new FilteringCondition("field", "operator", ["value"]);
    expect(condition.Type).toBe("and");
  });

  describe("when compiling a simple condition", () => {
    let condition: FilteringCondition;
    let field = "field";
    let operator = "operator";
    let value = "value";

    beforeEach( () => {
      condition = new FilteringCondition( field, operator, [value]);
    });

    it("compiles to a JSON object as expected by the Anemo API", () => {
      expect(condition.compile()).toEqual({ field, operator, values: [value], type: "and"});
    });
  });

  describe("when adding a condition with the AND/OR methods", () => {
    let condition: FilteringCondition;
    let field = "field";
    let operator = "operator";
    let value = "value";

    beforeEach( () => {
      condition = new FilteringCondition( field, operator, [value]);
    });

    it("creates the proper CompositeFilteringCondition object", () => {
      let compCondition = condition.or(new FilteringCondition(field, operator, ["value2"]));
      expect(compCondition.compile()).toEqual({
        conditions: [
          {field, operator, values: [value], type: "and"},
          {field, operator, values: ["value2"], type: "or"}],
        type: "and"});
    });
  });
});

describe("CompositeFilteringCondition class", () => {

  it("should use the given logical operator type", () => {
    const compCondition = new CompositeFilteringCondition(
      new FilteringCondition("field", "operator", ["value"]), "and");
    expect(compCondition.Type).toBe("and");
  });

  describe("when compiling a condition", () => {
    let compCondition: CompositeFilteringCondition;
    let field = "field";
    let operator = "operator";
    let value = "value";

    it("compiles to a JSON object as expected by the Anemo API", () => {
      compCondition = new CompositeFilteringCondition(new FilteringCondition( field, operator, [value]), "and");
      expect(compCondition.compile())
      .toEqual({ conditions: [{field, operator, values: [value], type: "and"}], type: "and"});
    });

    it("compiles to a JSON object as expected by the Anemo API when using the OR operator", () => {
      compCondition = new CompositeFilteringCondition(new FilteringCondition( field, operator, [value]), "and")
        .or(new FilteringCondition(field, operator, ["value2"]));
      expect(compCondition.compile() as any)
      .toEqual({
        conditions: [
          { field: "field", operator: "operator", values: ["value"], type: "and" },
          { field: "field", operator: "operator", values: ["value2"], type: "or" }],
        type: "and" });
    });

    it("compiles to a JSON object as expected by the Anemo API when using the AND operator", () => {
      compCondition = new CompositeFilteringCondition(new FilteringCondition( field, operator, [value]), "and")
        .and(new FilteringCondition(field, operator, ["value2"]));
      expect(compCondition.compile() as any)
      .toEqual({
        conditions: [
          { field: "field", operator: "operator", values: ["value"], type: "and" },
          { field: "field", operator: "operator", values: ["value2"], type: "and" }],
        type: "and" });
    });

    it("compiles to a JSON object as expected by the Anemo API when using the OR and the AND operator", () => {
      compCondition = new CompositeFilteringCondition(new FilteringCondition( field, operator, [value]), "and")
        .or(new FilteringCondition(field, operator, ["value2"]))
        .or(new FilteringCondition(field, operator, ["value3"]))
        .and(new FilteringCondition(field, operator, ["value4"]));
      expect(compCondition.compile() as any)
      .toEqual({
        conditions: [
          { field: "field", operator: "operator", values: ["value"], type: "and" },
          { field: "field", operator: "operator", values: ["value2"], type: "or" },
          { field: "field", operator: "operator", values: ["value3"], type: "or" },
          { field: "field", operator: "operator", values: ["value4"], type: "and" }],
        type: "and" });
    });
  });
});
