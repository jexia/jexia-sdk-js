// tslint:disable:no-string-literal
// tslint:disable:one-variable-per-declaration
import { createMockFor, createRequestExecuterMock, SpyObj } from "../spec/testUtils";
import { Dataset } from "../src";
import { DataRequest } from "../src/api/dataops/dataRequest";
import { field } from "../src/api/dataops/filteringApi";
import { SelectQuery } from "../src/api/dataops/selectQuery";
import { MESSAGE } from "../src/config/message";
import { RequestExecuter } from "../src/internal/executer";
import { Query } from "../src/internal/query";

describe("SelectQuery class", () => {
  const projectID = "projectID";
  const dataset = "dataset";
  const testFields = Object.freeze(["first_test_field", "second_test_field"]);

  function createSubject({
    datasetName = "dataset",
    queryMock = createMockFor(Query),
    mockDataRequest = true,
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject = new SelectQuery(requestExecuterMock as any, datasetName);
    let dataRequestMock: SpyObj<DataRequest> | null = null;
    if (mockDataRequest) {
      dataRequestMock = createMockFor(DataRequest, undefined, { Query: queryMock });
      subject["request"] = dataRequestMock;
    }
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

    it("should have the correct query for filter", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testFieldName = "testFieldName", testValue = "testValue";
      const queryObj = subject.where(field(testFieldName).isGreaterThan(testValue));
      expect(queryObj["request"].Query.Filter.compile())
        .toEqual({ type: "and", field: testFieldName, operator: ">", values: [ testValue ] });
    });

    it("should have the correct query for limit", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testNum = 666;
      const queryObj = subject.limit(testNum);
      expect(queryObj["request"].Query["limit"]).toEqual(testNum);
    });

    it("should have the correct query for offset", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testNum = 666;
      const queryObj = subject.offset(testNum);
      expect(queryObj["request"].Query["offset"]).toEqual(testNum);
    });

    it("should have the correct query for sortAsc", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const queryObj = subject.sortAsc(...testFields);
      expect(queryObj["request"].Query["orders"]).toEqual([{ fields: testFields, direction: "asc" }]);
    });

    it("should have the correct query for sortDesc", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const queryObj = subject.sortDesc(...testFields);
      expect(queryObj["request"].Query["orders"]).toEqual([{ fields: testFields, direction: "desc" }]);
    });

    it("should have the correct query for fields", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const queryObj = subject.fields(...testFields);
      expect(queryObj["request"].Query["fields"]).toEqual(testFields);
    });

    it("should have the correct query for relation without configured query", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testQuery = {};
      const datasetMock = createMockFor(Dataset, { returnValue: { request: { Query: testQuery } } });
      const queryObj = subject.relation(datasetMock);
      expect(queryObj["request"].Query["relations"]).toEqual([testQuery]);
    });

    it("should have the correct query for relation with configured query", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testQuery = {};
      const datasetMock = createMockFor(Dataset);
      const queryObj = subject.relation(datasetMock, () => ({ request: { Query: testQuery } } as any));
      expect(queryObj["request"].Query["relations"]).toEqual([testQuery]);
    });

    describe("sortAsc and sortDesc default param", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let queryObj: any;

      beforeAll(() => {
        queryObj = new SelectQuery(qe, "dataset");
      });

      ["sortAsc", "sortDesc"].forEach((method) => {
        it(`should throws and error when ${method} is called`, () => {
          expect(() => queryObj[method]()).toThrow(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
        });
      });
    });

  });

  it("should correct execute the query", () => {
    const { subject, dataRequestMock, requestExecuterMock } = createSubject();
    subject.execute();
    expect(dataRequestMock!.execute).toHaveBeenLastCalledWith(requestExecuterMock);
  });

});
