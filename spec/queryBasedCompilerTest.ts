import { QueryBasedCompiler } from "../src/compiler/queryBasedCompiler";
import { FilteringCondition } from "../src/filteringCondition";
import { QuerySet } from "../src/querySet";

describe("QueryBasedCompiler class", () => {
  let fields: string[];

  beforeAll( () => {
    fields = ["field1", "field2"];
  });

  describe("when executing a Query without an action set", () => {
    it("throws an error", () => {
      let query = new QuerySet();
      let compiler = new QueryBasedCompiler(query);
      expect(() => compiler.compile()).toThrow();
    });
  });

  describe("when receiving a Query with an action set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({action: "select"});
    });

    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "update";
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({action: "update"});
    });
  });

  describe("when receiving a Query with a limit set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.Limit = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({params: {range: {limit: 10}}, action: "select"});
    });
  });

  describe("when receiving a Query with an offset set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.Offset = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({params: {range: {offset: 10}}, action: "select"});
    });
  });

  describe("when receiving a Query with fields set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.Fields = fields;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({params: {fields}, action: "select"});
    });
  });

  describe("when receiving a Query with a filter set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.Filter = new FilteringCondition("field", "operator", "value");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({action: "select",
        params: {
          conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        }});
    });
  });

  describe("when receiving a Query with a sorting condition set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.AddSortCondition("ASC", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({action: "select",
        params: {
          orders: [{fields: [ "field1", "field2" ], direction: "ASC"}],
        },
      });
    });
  });

  describe("when receiving a Query with Records set", () => {
    it("compiles the query to the expected object literal", () => {
      let query = new QuerySet();
      let records = [{text: "text1"}, {text: "text2"}, {text: "text3"}];
      query.Action = "select";
      query.Records = records;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({ action: "select", records});
    });
  });

  describe("when receiving a Query with all options set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet();
      query.Action = "select";
      query.Offset = 10;
      query.Limit = 10;
      query.Fields = fields;
      query.Filter = new FilteringCondition("field", "operator", "value");
      query.AddSortCondition("ASC", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({action: "select", params: {
        conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        fields,
        orders: [{fields: [ "field1", "field2" ], direction: "ASC"}],
        range: {offset: 10, limit: 10},
      }});
    });
  });
});
