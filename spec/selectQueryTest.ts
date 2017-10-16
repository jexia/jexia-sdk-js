import { createRequestExecuterMock } from "../spec/testUtils";
import { field } from "../src/api/dataops/filteringApi";
import { SelectQuery } from "../src/api/dataops/selectQuery";

describe("SelectQuery class", () => {
  let appUrl: string;
  let dataset: string;

  beforeAll( () => {
    dataset = "dataset";
    appUrl = "appUrl";
  });

  describe("when instantiating a select object", () => {
    it("should be able to get the select query object", () => {
      let qe = createRequestExecuterMock(appUrl, dataset);
      let query: SelectQuery = new SelectQuery(qe, dataset);
      expect(query).toBeDefined();
    });
  });

  describe("when instantiating a select query object", () => {
    it("should expose the proper methods", () => {
      let qe = createRequestExecuterMock(appUrl, dataset);
      let query: SelectQuery = new SelectQuery(qe, dataset);
      expect(typeof(query.execute)).toBe("function");
      expect(typeof(query.fields)).toBe("function");
      expect(typeof(query.filter)).toBe("function");
      expect(typeof(query.limit)).toBe("function");
      expect(typeof(query.offset)).toBe("function");
      expect(typeof(query.sortAsc)).toBe("function");
      expect(typeof(query.sortDesc)).toBe("function");
    });
  });

  describe("when configuring a select query object", () => {
    it("it should have the correct query options set", () => {
      let qe = createRequestExecuterMock(appUrl, dataset);
      let cond = field("field").isMoreThan("value");
      let queryObj: any = new SelectQuery(qe, "dataset").filter(cond).limit(2).sortAsc("updated_at");
      expect(queryObj).toBeDefined();
      expect(queryObj.request).toBeDefined();
      expect(queryObj.request.Query).toBeDefined();
      expect(queryObj.request.Query.Filter.compile())
        .toEqual({ type: "and", field: "field", operator: ">", values: [ "value" ] });
      expect(queryObj.request.Query.limit).toEqual(2);
      expect(queryObj.request.Query.orders).toEqual([{fields: ["updated_at"], direction: "asc"}]);
    });
  });
});
