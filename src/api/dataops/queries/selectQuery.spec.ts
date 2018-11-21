// tslint:disable:no-string-literal
// tslint:disable:one-variable-per-declaration
import { createMockFor, createRequestExecuterMock } from "../../../../spec/testUtils";
import { MESSAGE } from "../../../config";
import { RequestExecuter } from "../../../internal/executer";
import { Query } from "../../../internal/query";
import { SelectQuery } from "./selectQuery";

interface ITestUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

describe("SelectQuery class", () => {
  const projectID = "projectID";
  const dataset = "dataset";
  const testFields = ["id", "name", "email"];

  function createSubject({
    datasetName = "dataset",
    mockQuery = true,
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject: SelectQuery<any> = new SelectQuery(requestExecuterMock as any, datasetName);
    let queryMock: Query = new Query(datasetName);

    if (mockQuery) {
      queryMock = createMockFor(Query);
      subject["query"] = queryMock;
    }
    return {
      datasetName,
      subject,
      requestExecuterMock,
      queryMock,
    };
  }

  describe("when instantiating a select object", () => {
    it("should be able to get the select query object", () => {
      let qe = createRequestExecuterMock(projectID, dataset);
      let selectQuery: SelectQuery<ITestUser> = new SelectQuery(qe, dataset);
      expect(selectQuery).toBeDefined();
    });
  });

  describe("when configuring a select query object", () => {

    it("should have the correct query for limit", () => {
      const { subject } = createSubject({ mockQuery: false });
      const testNum = 666;
      const queryObj = subject.limit(testNum);
      expect(queryObj["query"]["limit"]).toEqual(testNum);
    });

    it("should have the correct query for offset", () => {
      const { subject } = createSubject({ mockQuery: false });
      const testNum = 666;
      const queryObj = subject.offset(testNum);
      expect(queryObj["query"]["offset"]).toEqual(testNum);
    });

    it("should have the correct query for sortAsc with a single array", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortAsc([...testFields]);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: testFields, direction: "asc" }]);
    });

    it("should have the correct query for sortAsc with a single value", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortAsc(testFields[0]);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: [testFields[0]], direction: "asc" }]);
    });

    it("should have the correct query for sortAsc with multiple values", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortAsc(...testFields);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: testFields, direction: "asc" }]);
    });

    it("should have the correct query for sortDesc with a single array", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortDesc([...testFields]);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: testFields, direction: "desc" }]);
    });

    it("should have the correct query for sortDesc with a single value", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortDesc(testFields[0]);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: [testFields[0]], direction: "desc" }]);
    });

    it("should have the correct query for sortDesc with multiple values", () => {
      const { subject } = createSubject({ mockQuery: false });
      const queryObj = subject.sortDesc(...testFields);
      expect(queryObj["query"]["orders"]).toEqual([{ fields: testFields, direction: "desc" }]);
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

  it("without any params should execute the rest api", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let subject: any = new SelectQuery(qe, dataset);
    spyOn(subject["queryExecuter"], "executeRestRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeRestRequest).toHaveBeenCalled();
  });

  it("should execute the rest api if there is any param", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let subject: any = new SelectQuery(qe, dataset);
    subject.fields("id");
    spyOn(subject["queryExecuter"], "executeQueryRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeQueryRequest).toHaveBeenLastCalledWith(subject.compiledRequest);
  });

});
