import { createRequestExecuterMock } from "../spec/testUtils";
import { field } from "../src/api/dataops/filteringApi";
import { SelectQuery } from "../src/api/dataops/selectQuery";
import { MESSAGE } from "../src/config/message";

describe("SelectQuery class", () => {
  let projectID: string;
  let dataset: string;

  beforeAll( () => {
    dataset = "dataset";
    projectID = "projectID";
  });

  describe("when instantiating a select object", () => {
    it("should be able to get the select query object", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let query: SelectQuery = new SelectQuery(qe, dataset);
      expect(query).toBeDefined();
    });
  });

  describe("when instantiating a select query object", () => {
    it("should expose the proper methods", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let query: SelectQuery = new SelectQuery(qe, dataset);
      expect(typeof(query.execute)).toBe("function");
      expect(typeof(query.fields)).toBe("function");
      expect(typeof(query.where)).toBe("function");
      expect(typeof(query.limit)).toBe("function");
      expect(typeof(query.offset)).toBe("function");
      expect(typeof(query.sortAsc)).toBe("function");
      expect(typeof(query.sortDesc)).toBe("function");
    });
  });

  describe("when configuring a select query object", () => {
    it("it should have the correct query options set", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let cond = field("field").isGreaterThan("value");
      let queryObj: any = new SelectQuery(qe, "dataset").where(cond).limit(2).sortAsc("updated_at");
      expect(queryObj).toBeDefined();
      expect(queryObj.request).toBeDefined();
      expect(queryObj.request.Query).toBeDefined();
      expect(queryObj.request.Query.Filter.compile())
        .toEqual({ type: "and", field: "field", operator: ">", values: [ "value" ] });
      expect(queryObj.request.Query.limit).toEqual(2);
      expect(queryObj.request.Query.orders).toEqual([{fields: ["updated_at"], direction: "asc"}]);
    });
  });

  describe("sortAsc and sortDesc default param", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let queryObj: any;

    beforeAll(() => {
      queryObj = new SelectQuery(qe, "dataset");
    });

    ["sortAsc", "sortDesc"].forEach((method) => {
      it(`it should throws and error when ${method} is called`, () => {
        expect(() => queryObj[method]()).toThrowError(Error, MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
      });
    });
  });
});
