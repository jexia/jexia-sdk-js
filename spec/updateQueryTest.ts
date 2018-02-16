// tslint:disable:no-string-literal
import { createMockFor, createRequestExecuterMock, deepFreeze } from "../spec/testUtils";
import { field } from "../src";
import { DataRequest } from "../src/api/dataops/dataRequest";
import { UpdateQuery } from "../src/api/dataops/updateQuery";
import { RequestExecuter } from "../src/internal/executer";
import { Query } from "../src/internal/query";

describe("UpdateQuery class", () => {
  const projectID = "projectID";
  const dataset = "dataset";
  const defaultData = deepFreeze({ title: "changed first field" });

  function createSubject({
    datasetName = "dataset",
    queryMock = createMockFor(Query),
    requestExecuterMock = createMockFor(RequestExecuter),
    data = defaultData,
  } = {}) {
    const subject = new UpdateQuery(requestExecuterMock as any, data, datasetName);
    const dataRequestMock = createMockFor(DataRequest, undefined, { Query: queryMock });
    subject["request"] = dataRequestMock as any;
    return {
      datasetName,
      subject,
      requestExecuterMock,
      dataRequestMock,
      queryMock,
    };
  }

  describe("when instantiating a updateQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = createRequestExecuterMock(projectID, dataset);
        let query = new UpdateQuery(qe, {title: "changed first field"}, dataset);
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {
    it("should expose the proper methods", (done) => {
        let qe = createRequestExecuterMock(projectID, dataset);
        let query = new UpdateQuery(qe, { title: "changed first field"}, dataset);
        expect(typeof query.where).toBe("function");
        expect(typeof query.limit).toBe("function");
        expect(typeof query.offset).toBe("function");
        expect(typeof query.sortAsc).toBe("function");
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {

    it("should use the correct filter criteria when receiving it directly", () => {
      const filter = field("field").isGreaterThan("value");
      const { subject, queryMock } = createSubject();
      subject.where(filter);
      expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
    });

    it("should use the correct filter criteria when passing it from a callback function", () => {
      let filter;
      const { subject, queryMock } = createSubject();
      subject.where((f) => filter = f("title").isGreaterThan("value"));
      expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
    });

  });

});
