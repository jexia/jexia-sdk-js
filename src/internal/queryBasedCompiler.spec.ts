import { FilteringCondition } from "../api/dataops/filteringCondition";
import { QueryAction } from "../api/dataops/queries/baseQuery";
import { Query } from "./query";
import { compileDataRequest, QueryBasedCompiler } from "./queryBasedCompiler";

describe("compileDataRequest function", () => {
  let request: { action: QueryAction; records: any[]; query: Query };

  beforeEach(() => {
    request = {action: QueryAction.select, records: [], query: new Query("dataset")};
  });

  describe("when compiling a Request that does not have an action set", () => {
    it("throws an error", () => {
      (request as any).action = "";
      expect(() => compileDataRequest(request)).toThrow();
    });
  });

  describe("when compiling a Request with an action set", () => {
    it("it compiles the Request to the expected object literal", () => {
      expect(compileDataRequest(request)).toEqual({ action: "select", records: [] });
    });

    it("it compiles the Request to the expected object literal", () => {
      request.action = QueryAction.update;
      expect(compileDataRequest(request)).toEqual({ action: "update", records: [] });
    });
  });

  describe("when compiling a Request with Records set", () => {
    it("compiles the Request to the expected object literal", () => {
      let records = [{text: "text1"}, {text: "text2"}, {text: "text3"}];
      request.records = records;
      expect(compileDataRequest(request)).toEqual({ action: "select", records });
    });
  });
});

describe("QueryBasedCompiler class", () => {
  let fields: string[];
  let dataset: string;
  let data: object;

  beforeAll( () => {
    fields = ["field1", "field2"];
    dataset = "dataset";
    data = {field: "value"};
  });

  describe("when receiving a Query with a limit set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Limit = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({range: {limit: 10}});
    });
  });

  describe("when receiving a Query with an offset set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Offset = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({range: {offset: 10}});
    });
  });

  describe("when receiving a Query with fields set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Fields = fields;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({fields});
    });
  });

  describe("when receiving a Query with a filter set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Filter = new FilteringCondition("field", "operator", ["value"]);
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
          conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
      });
    });
  });

  describe("when trying to set sort condition without fields", () => {
    it("it should throw an error", () => {
      let query = new Query(dataset);
      expect(() => query.AddSortCondition("asc")).toThrow();
    });
  });

  describe("when receiving a Query with a sorting condition set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.AddSortCondition("asc", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
          orders: [{fields: [ "field1", "field2" ], direction: "asc"}],
      });
    });
  });

  describe("when receiving a Query with a filtering condition set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      (query as any).setFilterCriteria({
        lowLevelCondition: "test",
      });
      expect((query as any).filteringConditions).toEqual("test");
    });
  });

  describe("when receiving a Query with Data set", () => {
    it("compiles the query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Data = data;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({data});
    });
  });

  describe("when receiving a Query with all options set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new Query(dataset);
      query.Offset = 10;
      query.Limit = 10;
      query.Fields = fields;
      query.Filter = new FilteringCondition("field", "operator", ["value"]);
      query.AddSortCondition("asc", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
        conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        fields,
        orders: [{fields: [ "field1", "field2" ], direction: "asc"}],
        range: {offset: 10, limit: 10},
      });
    });
  });
});

describe("Request - Query compiling integration tests", () => {
  let request: { action: QueryAction; records: any[]; query: Query };

  beforeEach( () => {
    request = {action: QueryAction.select, records: [], query: new Query("dataset")};
  });

  describe("when setting up a simple request", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      expect(compileDataRequest(request)).toEqual({action: "select", records: []});
    });
  });

  describe("when setting up a request with query options but without relations", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      request.query.Offset = 10;
      request.query.Limit = 10;
      request.query.Fields = ["field1", "field2"];
      request.query.Filter = new FilteringCondition("field", "operator", ["value"]);
      request.query.AddSortCondition("asc", "field1", "field2");
      expect(compileDataRequest(request)).toEqual({action: "select", params: {
        conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        fields: [ "field1", "field2" ],
        orders: [{fields: [ "field1", "field2" ], direction: "asc"}],
        range: {offset: 10, limit: 10},
      }, records: []});
    });
  });

  describe("when setting up a request with one level of relations nesting", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      let fields = ["field1", "field2"];
      let relation1 = new Query("relation1");
      let relation2 = new Query("relation2");
      relation1.Fields = fields;
      relation2.Fields = fields;
      request.query.Fields = fields;
      request.query.AddRelation(relation1);
      request.query.AddRelation(relation2);
      expect(compileDataRequest(request)).toEqual({action: "select", params: {
        fields,
        relations: {
          relation1: {
            fields,
          },
          relation2: {
            fields,
          },
        },
      }, records: []});
    });
  });

  describe("when setting up a request with two levels of relations nesting", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      let fields = ["field1", "field2"];
      let relation1 = new Query("relation1");
      let relation2 = new Query("relation2");
      let relation3 = new Query("relation3");
      let relation4 = new Query("relation4");
      relation1.Fields = fields;
      relation2.Fields = fields;
      relation3.Fields = fields;
      relation4.Fields = fields;
      relation1.AddRelation(relation3);
      relation2.AddRelation(relation4);
      request.query.Fields = fields;
      request.query.AddRelation(relation1);
      request.query.AddRelation(relation2);
      expect(compileDataRequest(request)).toEqual({action: "select", params: {
        fields,
        relations: {
          relation1: {
            fields,
            relations: { relation3: {fields} },
          },
          relation2: {
            fields,
            relations: { relation4: {fields} },
          },
        },
      }, records: []});
    });
  });
});
