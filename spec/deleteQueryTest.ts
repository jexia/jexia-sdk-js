// tslint:disable:no-string-literal
// tslint:disable:one-variable-per-declaration
import { createMockFor, createRequestExecuterMock, SpyObj } from "../spec/testUtils";
import { DataRequest } from "../src/api/dataops/dataRequest";
import { DeleteQuery } from "../src/api/dataops/deleteQuery";
import { field } from "../src/api/dataops/filteringApi";
import { MESSAGE } from "../src/config/message";
import { RequestExecuter } from "../src/internal/executer";
import { Query } from "../src/internal/query";

describe("DeleteQuery class", () => {
  const projectID = "projectID";
  const dataset = "dataset";
  const testFields = Object.freeze(["first_test_field", "second_test_field"]);

  function createSubject({
    datasetName = "dataset",
    queryMock = createMockFor(Query),
    mockDataRequest = true,
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject = new DeleteQuery(requestExecuterMock as any, datasetName);
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

  describe("when configuring a deleteQuery object", () => {

    it("should have the correct query for filter", () => {
      const { subject } = createSubject({ mockDataRequest: false });
      const testFieldName = "testFieldName", testValue = "testValue";
      const queryObj = subject.where(field(testFieldName).isGreaterThan(testValue));
      expect(queryObj["request"].Query.Filter.compile())
        .toEqual({ type: "and", field: testFieldName, operator: ">", values: [testValue] });
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

    describe("sortAsc and sortDesc default param", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let queryObj: any;

      beforeAll(() => {
        queryObj = new DeleteQuery(qe, "dataset");
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
