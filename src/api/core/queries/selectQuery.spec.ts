// tslint:disable:no-string-literal
import * as faker from "faker";
// tslint:disable:one-variable-per-declaration
import { createMockFor } from "../../../../spec/testUtils";
import { MESSAGE } from "../../../config";
import { RequestExecuter } from "../../../internal/executer";
import { Query } from "../../../internal/query";
import { ResourceType } from "../resource";
import { SelectQuery } from "./selectQuery";

describe("SelectQuery class", () => {
  const testFields = ["id", "name", "email"];

  function createSubject({
    resourceName = faker.random.word(),
    resourceType = faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
    mockQuery = true,
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject: SelectQuery<any> = new SelectQuery(requestExecuterMock as any, resourceType, resourceName);
    let queryMock: Query = new Query();

    if (mockQuery) {
      queryMock = createMockFor(Query);
      subject["query"] = queryMock;
    }
    return {
      resourceType,
      resourceName,
      subject,
      requestExecuterMock,
      queryMock,
    };
  }

  describe("when instantiating", () => {
    it("should be defined", () => {
      const { subject } = createSubject();
      expect(subject).toBeDefined();
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
      it(`should throws and error when sortAsc is called`, () => {
        const { subject } = createSubject();
        expect(() => subject.sortAsc()).toThrow(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
      });

      it(`should throws and error when sortDesc is called`, () => {
        const { subject } = createSubject();
        expect(() => subject.sortDesc()).toThrow(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
      });
    });

  });

  it("should correct execute the query", () => {
    const { subject } = createSubject();
    subject.fields("id");
    spyOn(subject["queryExecuter"], "executeRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeRequest).toHaveBeenLastCalledWith((subject as any).compiledRequest);
  });

});
