import { compileDataRequest, QueryBasedCompiler } from "../src/compiler/queryBasedCompiler";
import { DataRequest } from "../src/dataRequest";
import { FilteringCondition } from "../src/filteringCondition";
import { QuerySet } from "../src/querySet";

describe("compileDataRequest function", () => {
  let request: DataRequest;

  beforeEach(() => {
    request = new DataRequest("select", "dataset");
  });

  describe("when compiling a Request that does not have an action set", () => {
    it("throws an error", () => {
      request.Action = "";
      expect(() => compileDataRequest(request)).toThrow();
    });
  });

  describe("when compiling a Request with an action set", () => {
    it("it compiles the Request to the expected object literal", () => {
      expect(compileDataRequest(request)).toEqual({action: "select"});
    });

    it("it compiles the Request to the expected object literal", () => {
      request.Action = "update";
      expect(compileDataRequest(request)).toEqual({action: "update"});
    });
  });

  describe("when compiling a Request with Records set", () => {
    it("compiles the Request to the expected object literal", () => {
      let records = [{text: "text1"}, {text: "text2"}, {text: "text3"}];
      request.Records = records;
      expect(compileDataRequest(request)).toEqual({ action: "select", records});
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
      let query = new QuerySet(dataset);
      query.Limit = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({range: {limit: 10}});
    });
  });

  describe("when receiving a Query with an offset set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.Offset = 10;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({range: {offset: 10}});
    });
  });

  describe("when receiving a Query with fields set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.Fields = fields;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({fields});
    });
  });

  describe("when receiving a Query with a filter set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.Filter = new FilteringCondition("field", "operator", "value");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
          conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
      });
    });
  });

  describe("when receiving a Query with a sorting condition set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.AddSortCondition("ASC", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
          orders: [{fields: [ "field1", "field2" ], direction: "ASC"}],
      });
    });
  });

  describe("when receiving a Query with Data set", () => {
    it("compiles the query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.Data = data;
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({data});
    });
  });

  describe("when receiving a Query with all options set", () => {
    it("it compiles the Query to the expected object literal", () => {
      let query = new QuerySet(dataset);
      query.Offset = 10;
      query.Limit = 10;
      query.Fields = fields;
      query.Filter = new FilteringCondition("field", "operator", "value");
      query.AddSortCondition("ASC", "field1", "field2");
      let compiler = new QueryBasedCompiler(query);
      expect(compiler.compile()).toEqual({
        conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        fields,
        orders: [{fields: [ "field1", "field2" ], direction: "ASC"}],
        range: {offset: 10, limit: 10},
      });
    });
  });
});

describe("Request - Query compiling integration tests", () => {
  let request: DataRequest;

  beforeEach( () => {
    request = new DataRequest("select", "dataset");
  });

  describe("when setting up a simple request", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      expect(compileDataRequest(request)).toEqual({action: "select"});
    });
  });

  describe("when setting up a request with query options but without relations", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      request.Query.Offset = 10;
      request.Query.Limit = 10;
      request.Query.Fields = ["field1", "field2"];
      request.Query.Filter = new FilteringCondition("field", "operator", "value");
      request.Query.AddSortCondition("ASC", "field1", "field2");
      expect(compileDataRequest(request)).toEqual({action: "select", params: {
        conditions: [{ field: "field", operator: "operator", values: [ "value" ], type: "and" }],
        fields: [ "field1", "field2" ],
        orders: [{fields: [ "field1", "field2" ], direction: "ASC"}],
        range: {offset: 10, limit: 10},
      }});
    });
  });

  describe("when setting up a request with one level of relations nesting", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      let fields = ["field1", "field2"];
      let relation1 = new QuerySet("relation1");
      let relation2 = new QuerySet("relation2");
      relation1.Fields = fields;
      relation2.Fields = fields;
      request.Query.Fields = fields;
      request.Query.AddRelation(relation1);
      request.Query.AddRelation(relation2);
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
      }});
    });
  });

  describe("when setting up a request with two levels of relations nesting", () => {
    it("gets compiled to an object literal as expected by the back-end", () => {
      let fields = ["field1", "field2"];
      let relation1 = new QuerySet("relation1");
      let relation2 = new QuerySet("relation2");
      let relation3 = new QuerySet("relation3");
      let relation4 = new QuerySet("relation4");
      relation1.Fields = fields;
      relation2.Fields = fields;
      relation3.Fields = fields;
      relation4.Fields = fields;
      relation1.AddRelation(relation3);
      relation2.AddRelation(relation4);
      request.Query.Fields = fields;
      request.Query.AddRelation(relation1);
      request.Query.AddRelation(relation2);
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
      }});
    });
  });
});
