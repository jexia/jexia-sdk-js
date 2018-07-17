import { Dataset } from "../../..";
import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { Query } from "../../../internal/query";
import { field } from "../filteringApi";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

interface IUser {
  id: number;
  name: string;
}

let createSubject = ({
  action = QueryAction.select,
  datasetName = "dataset",
  requestExecuterMock = createMockFor(RequestExecuter),
  createMockForQuery = true,
} = {}) => {
  // Declare child class as long as FilterableQuery is abstract
  class FilterableQueryChild<T> extends FilterableQuery<T> {
    constructor(r: RequestExecuter, a: QueryAction, d: string) {
      super(r, a, d);
    }
  }

  const subject = new FilterableQueryChild<IUser>(requestExecuterMock, action, datasetName);
  let queryMock = createMockForQuery ? createMockFor(Query) : new Query(datasetName);

  // tslint:disable-next-line:no-string-literal
  subject["query"] = queryMock;

  return {
    datasetName,
    subject,
    requestExecuterMock,
    queryMock,
  };
};

describe("QueryRequest class", () => {
  const { subject } = createSubject();

  it("should be created", () => {
    expect(subject).toBeDefined();
  });

  it("where method should be defined", () => {
    expect(subject.where).toBeDefined();
  });

  it("relation method should be defined", () => {
    expect(subject.relation).toBeDefined();
  });
});

describe("when instantiating a select query object", () => {

  it("should use the correct filter criteria when receiving it directly", () => {
    const filter = field("name").isGreaterThan("John");
    const { subject, queryMock } = createSubject();
    subject.where(filter);
    expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
  });

  it("should use the correct filter criteria when passing it from a callback function", () => {
    let filter;
    const { subject, queryMock } = createSubject();
    subject.where((f) => {
      filter = f("name").isEqualTo("John");
      return filter;
    });
    expect(queryMock.setFilterCriteria).toHaveBeenCalledWith(filter);
  });

  it("should have the correct query for relation without configured query", () => {
    const { subject } = createSubject({ createMockForQuery: false });
    const testQuery = {};
    const datasetMock = createMockFor(Dataset, { returnValue: { query: testQuery } });
    const queryObj = subject.relation(datasetMock);
    // tslint:disable-next-line:no-string-literal
    expect(queryObj["query"]["relations"]).toEqual([testQuery]);
  });

  it("should have the correct query for relation with configured query", () => {
    const { subject } = createSubject({ createMockForQuery: false });
    const testQuery = {};
    const datasetMock = createMockFor(Dataset);
    const queryObj = subject.relation(datasetMock, () => ({ query: testQuery } as any));
    // tslint:disable-next-line:no-string-literal
    expect(queryObj["query"]["relations"]).toEqual([testQuery]);
  });
});
