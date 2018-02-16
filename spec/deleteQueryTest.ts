// tslint:disable:no-string-literal
import { createMockFor } from "../spec/testUtils";
import { DataRequest } from "../src/api/dataops/dataRequest";
import { DeleteQuery } from "../src/api/dataops/deleteQuery";
import { field } from "../src/api/dataops/filteringApi";
import { RequestExecuter } from "../src/internal/executer";
import { Query } from "../src/internal/query";

describe("DeleteQuery class", () => {

  function createSubject({
    datasetName = "dataset",
    queryMock = createMockFor(Query),
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject = new DeleteQuery(requestExecuterMock as any, datasetName);
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

  describe("when instantiating a deleteQuery object", () => {
    it("should expose the proper methods", () => {
      const { subject: query } = createSubject();
      expect(typeof query.where).toBe("function");
      expect(typeof query.limit).toBe("function");
      expect(typeof query.offset).toBe("function");
      expect(typeof query.sortAsc).toBe("function");
      expect(typeof query.execute).toBe("function");
    });
  });

  describe("when configuring a deleteQuery object", () => {

    it("should use the correct filter criteria when receiving it directly", () => {
      const filter = field("field").isGreaterThan("value");
      const { subject, queryMock } = createSubject();
      subject.where(filter);
      expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
    });

    it("should use the correct filter criteria when passing it from a callback function", () => {
      let filter;
      const { subject, queryMock } = createSubject();
      subject.where((f) => {
        filter = f("field").isGreaterThan("value");
        return filter;
      });
      expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
    });

  });

});
