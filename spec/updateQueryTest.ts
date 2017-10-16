import { createRequestExecuterMock } from "../spec/testUtils";
import { FilteringCondition } from "../src/api/dataops/filteringCondition";
import { UpdateQuery } from "../src/api/dataops/updateQuery";

describe("UpdateQuery class", () => {
  let appUrl: string;
  let dataset: string;

  beforeAll( () => {
    dataset = "dataset";
    appUrl = "appUrl";
  });

  describe("when instantiating a updateQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = createRequestExecuterMock(appUrl, dataset);
        let query = new UpdateQuery(qe, {title: "changed first field"}, dataset);
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {
    it("should expose the proper methods", (done) => {
        let qe = createRequestExecuterMock(appUrl, dataset);
        let query = new UpdateQuery(qe, { title: "changed first field"}, dataset);
        expect(typeof query.filter).toBe("function");
        expect(typeof query.limit).toBe("function");
        expect(typeof query.offset).toBe("function");
        expect(typeof query.sortAsc).toBe("function");
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        let qe = createRequestExecuterMock(appUrl, dataset);
        let queryObj: any = new UpdateQuery(qe, {title: "changed first field"}, dataset)
        .filter(new FilteringCondition("field", "operator", ["value"])).limit(2);
        expect(queryObj).toBeDefined();
        expect(queryObj.request).toBeDefined();
        expect(queryObj.request.Query).toBeDefined();
        expect(queryObj.request.Query.data).toEqual({ title: "changed first field" });
        expect(queryObj.request.Query.limit).toEqual(2);
        done();
    });
  });

});
