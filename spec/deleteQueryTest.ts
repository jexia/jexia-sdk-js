import { createRequestExecuterMock } from "../spec/testUtils";
import { DeleteQuery } from "../src/api/dataops/deleteQuery";
import { field } from "../src/api/dataops/filteringApi";

describe("DeleteQuery class", () => {
  let projectID: string;
  let dataset: string;

  beforeAll( () => {
    dataset = "dataset";
    projectID = "projectID";
  });

  describe("when instantiating a deleteQuery object directly", () => {
    it("should be able to return required object", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let query = new DeleteQuery(qe, dataset);
      expect(query).toBeDefined();
    });
  });

  describe("when instantiating a deleteQuery object", () => {
    it("should expose the proper methods", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let query = new DeleteQuery(qe, dataset);
      expect(typeof query.filter).toBe("function");
      expect(typeof query.limit).toBe("function");
      expect(typeof query.offset).toBe("function");
      expect(typeof query.sortAsc).toBe("function");
      expect(typeof query.execute).toBe("function");
    });
  });

  describe("when configuring a deleteQuery object", () => {
    it("its query object should have the correct query options set", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let cond = field("field").isMoreThan("value");
      let queryObj: any = new DeleteQuery(qe, dataset).filter(cond);
      expect(queryObj).toBeDefined();
      expect(queryObj.request).toBeDefined();
      expect(queryObj.request.Query).toBeDefined();
      expect(queryObj.request.Query.Filter.compile())
        .toEqual({ type: "and", field: "field", operator: ">", values: [ "value" ] });
    });
  });

});
