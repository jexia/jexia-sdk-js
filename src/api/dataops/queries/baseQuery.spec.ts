import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { BaseQuery, QueryAction } from "./baseQuery";

interface IUser {
  id: number;
  name: string;
}

let createSubject = ({
  action = QueryAction.select,
  datasetName = "dataset",
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  // Declare child class as long as QueryRequest is abstract
  class BaseQueryChild<T> extends BaseQuery<T> {};

  const subject = new BaseQueryChild<IUser>(requestExecuterMock, action, datasetName);

  return {
    datasetName,
    subject,
    requestExecuterMock,
  };
};

describe("QueryRequest class", () => {
  const { subject } = createSubject();

  it("should be created", () => {
    expect(subject).toBeDefined();
  });

  it("queryExecuter should be defined", () => {
    expect((subject as any).queryExecuter).toBeDefined();
  });

  it("action should equal 'select' action", () => {
    expect((subject as any).action).toEqual(QueryAction.select);
  });

  it("Query should be defined", () => {
    expect((subject as any).query).toBeDefined();
  });

  it("Query dataset should be set to 'dataset'", () => {
    expect((subject as any).query.dataSet).toEqual("dataset");
  });
});

describe("fields method", () => {
  it("should accept one field as string", () => {
    const { subject } = createSubject();
    subject.fields("id");
    expect((subject as any).query.Fields).toEqual(["id"]);
  });

  it("should accept severeal fields as strings", () => {
    const { subject } = createSubject();
    subject.fields("id", "name");
    expect((subject as any).query.Fields).toEqual(["id", "name"]);
  });

  it("should accept one field as an array", () => {
    const { subject } = createSubject();
    subject.fields(["id"]);
    expect((subject as any).query.Fields).toEqual(["id"]);
  });

  it("should accept several fields in an array", () => {
    const { subject } = createSubject();
    subject.fields(["id", "name"]);
    expect((subject as any).query.Fields).toEqual(["id", "name"]);
  });
});

describe("execute method", () => {
  it("should call queryExecuter.executeRequest()", () => {
    let { subject, requestExecuterMock } = createSubject({action: QueryAction.select});
    subject.execute();
    expect(requestExecuterMock.executeQueryRequest).toHaveBeenLastCalledWith({action: "select"});
  });
});
