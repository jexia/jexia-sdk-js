import { IAggField } from "jexia-sdk-js/internal/query";
import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { BaseQuery, QueryAction } from "./baseQuery";

interface IUser {
  id: number;
  name: string;
  age: number;
}

let createSubject = ({
  action = QueryAction.select,
  datasetName = "dataset",
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  // Declare child class as long as BaseQuery class is abstract
  class BaseQueryChild<T> extends BaseQuery<T> {
    constructor(r: RequestExecuter, a: QueryAction, d: string) {
      super(r, a, d);
    }
  }

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
    expect((subject as any).query.dataset).toEqual("dataset");
  });
});

describe("fields method", () => {
  it("should accept one field as string", () => {
    const { subject } = createSubject();
    subject.fields("id");
    expect((subject as any).query.fields).toEqual(["id"]);
  });

  it("should accept several fields as strings", () => {
    const { subject } = createSubject();
    subject.fields("id", "name");
    expect((subject as any).query.fields).toEqual(["id", "name"]);
  });

  it("should accept one field as an array", () => {
    const { subject } = createSubject();
    subject.fields(["id"]);
    expect((subject as any).query.fields).toEqual(["id"]);
  });

  it("should accept several fields in an array", () => {
    const { subject } = createSubject();
    subject.fields(["id", "name"]);
    expect((subject as any).query.fields).toEqual(["id", "name"]);
  });

  it("should accept aggregation object", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "AVG", col: "age"};
    subject.fields(aggField);
    expect((subject as any).query.fields).toEqual([aggField]);
  });

  it("should accept several fields and aggregation object", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "AVG", col: "age"};
    subject.fields("id", "name", aggField);
    expect((subject as any).query.fields).toEqual(["id", "name", aggField]);
  });

  it("should accept aggregation object and several fields", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "AVG", col: "age"};
    subject.fields(aggField, "id", "name");
    expect((subject as any).query.fields).toEqual([aggField, "id", "name"]);
  });

  it("should accept several fields and aggregation object as an array", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "AVG", col: "age"};
    subject.fields(["id", "name", aggField]);
    expect((subject as any).query.fields).toEqual(["id", "name", aggField]);
  });
});

describe("compiledRequest method", () => {
  let { subject } = createSubject();
  it("should return compiled object", () => {
    expect((subject as any).compiledRequest).toEqual({
      action: QueryAction.select,
    });
  });
});

describe("execute method", () => {
  it("should call queryExecuter.executeRestRequest()", () => {
    let { subject, requestExecuterMock } = createSubject({action: QueryAction.select});
    subject.execute();
    expect(requestExecuterMock.executeRestRequest).toHaveBeenCalled();
  });
});
