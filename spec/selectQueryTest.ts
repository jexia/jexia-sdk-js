// tslint:disable:no-string-literal
import { createMockFor, createRequestExecuterMock } from "../spec/testUtils";
import { DataRequest } from "../src/api/dataops/dataRequest";
import { field } from "../src/api/dataops/filteringApi";
import { SelectQuery } from "../src/api/dataops/selectQuery";
import { MESSAGE } from "../src/config/message";
import { RequestExecuter } from "../src/internal/executer";
import { Query } from "../src/internal/query";

describe("SelectQuery class", () => {
  const projectID = "projectID";
  const dataset = "dataset";

  function createSubject({
    datasetName = "dataset",
    queryMock = createMockFor(Query),
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject = new SelectQuery(requestExecuterMock as any, datasetName);
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

  describe("when instantiating a select object", () => {
    it("should be able to get the select query object", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let query: SelectQuery = new SelectQuery(qe, dataset);
      expect(query).toBeDefined();
    });
  });

  describe("when instantiating a select query object", () => {

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
        expect(() => queryObj[method]()).toThrow(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
      });
    });
  });
});
