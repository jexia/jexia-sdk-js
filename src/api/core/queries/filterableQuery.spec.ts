import * as faker from "faker";
import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { Query } from "../../../internal/query";
import { field } from "../../dataops/filteringApi";
import { ResourceType } from "../resource";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

interface IUser {
  id: number;
  name: string;
}

let createSubject = ({
  action = QueryAction.select,
  resourceName = faker.random.word(),
  resourceType = faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
  requestExecuterMock = createMockFor(RequestExecuter),
  createMockForQuery = true,
} = {}) => {
  // Declare child class as long as FilterableQuery is abstract
  class FilterableQueryChild<T> extends FilterableQuery<T> {
    constructor(r: RequestExecuter, a: QueryAction, t: ResourceType, d: string) {
      super(r, a, t, d);
    }
  }

  const subject = new FilterableQueryChild<IUser>(requestExecuterMock, action, resourceType, resourceName);
  let queryMock = createMockForQuery ? createMockFor<Query>(Query) : new Query();

  // tslint:disable-next-line:no-string-literal
  subject["query"] = queryMock;

  return {
    resourceName,
    resourceType,
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
});
