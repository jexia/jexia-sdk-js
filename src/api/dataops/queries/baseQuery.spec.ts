import * as faker from "faker";
import { createMockFor, getRandomQueryAction } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { IAggField } from "../../../internal/query";
import { BaseQuery, QueryAction } from "./baseQuery";

interface IUser {
  id: number;
  name: string;
  age: number;
}

const DATASET_NAME = faker.random.word();
const DEFAULT_ACTION = getRandomQueryAction();

const createSubject = ({
  action = DEFAULT_ACTION,
  datasetName = DATASET_NAME,
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  // Declare child class as long as BaseQuery class is abstract
  class BaseQueryChild<T> extends BaseQuery<T> {
    protected readonly body = null;
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

describe("BaseQuery class", () => {
  const { subject } = createSubject();

  it("should be created", () => {
    expect(subject).toBeDefined();
  });

  it("queryExecuter should be defined", () => {
    expect((subject as any).queryExecuter).toBeDefined();
  });

  it("action should equal passed action", () => {
    expect((subject as any).action).toEqual(DEFAULT_ACTION);
  });

  it("Query should be defined", () => {
    expect((subject as any).query).toBeDefined();
  });

  it("Query dataset should be set to the passed one", () => {
    expect((subject as any).query.dataset).toEqual(DATASET_NAME);
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
  let subject: any;

  beforeEach(() => {
    ({ subject } = createSubject());
  });

  it("should contain correct action key", () => {
    expect(subject.compiledRequest.action).toEqual(DEFAULT_ACTION);
  });

  it("should contain empty body by default", () => {
    expect(subject.compiledRequest.body).toEqual({});
  });

  it("should contain body", () => {
    subject.body = [
      faker.random.word(),
    ];
    expect(subject.compiledRequest.body).toBe(subject.body);
  });

  it("should contain queryParams", () => {
    const queryParams = [];
    spyOn(subject.query, "compileToQueryParams").and.returnValue(queryParams);

    expect(subject.compiledRequest.queryParams).toBe(queryParams);
  });

  it("should contain empty array for queryParams when its nullable", () => {
    const queryParams = faker.helpers.randomize([null, undefined]);
    spyOn(subject.query, "compileToQueryParams").and.returnValue(queryParams);

    expect(subject.compiledRequest.queryParams).toEqual([]);
  });
});

describe("execute method", () => {
  it("should call queryExecuter.executeRestRequest()", () => {
    let { subject, requestExecuterMock } = createSubject();
    subject.execute();
    expect(requestExecuterMock.executeRequest).toHaveBeenCalled();
  });
});
