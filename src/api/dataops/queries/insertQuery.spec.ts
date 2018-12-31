// tslint:disable:no-string-literal
import { createRequestExecuterMock } from "../../../../spec/testUtils";
import { InsertQuery } from "./insertQuery";

describe("InsertQuery class", () => {
  let projectID: string;
  let dataset: string;

  beforeAll(() => {
    dataset = "dataset";
    projectID = "projectID";
  });

  describe("when instantiating a insertQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = createRequestExecuterMock(projectID, dataset);
        let query = new InsertQuery(qe, [{title: "Another first post", user_id: 1}], dataset);
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a insertQuery object from client", () => {
    it("should be able to invoke methods exposed by it", (done) => {
        let qe = createRequestExecuterMock(projectID, dataset);
        let query = new InsertQuery(qe, [{title: "Another first post", user_id: 1}], dataset);
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a insertQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        let qe = createRequestExecuterMock(projectID, dataset);
        let queryObj: any = new InsertQuery(qe, [{title: "Another first post", user_id: 1}], dataset);
        expect(queryObj).toBeDefined();
        expect(queryObj.records).toEqual([{title: "Another first post", user_id: 1}]);
        done();
    });
  });

  it("should correct execute the query", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let subject: any = new InsertQuery(qe, [{ title: "Another first post", user_id: 1 }], dataset);
    spyOn(subject["queryExecuter"], "executeRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeRequest).toHaveBeenLastCalledWith({
      action: "insert", records: subject["records"]
    });
  });
});
