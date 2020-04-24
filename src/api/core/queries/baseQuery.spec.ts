import * as faker from "faker";
import { of, throwError } from "rxjs";
import { createMockFor, getRandomRequestMethod, getRandomResourceType } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { IAggField } from "../../../internal/query";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { ResourceType } from "../resource";
import { BaseQuery } from "./baseQuery";

interface IUser {
  id: number;
  name: string;
  age: number;
}

const RESOURCE_NAME = faker.random.word();
const RESOURCE_TYPE = getRandomResourceType();
const DEFAULT_REQUEST_METHOD = getRandomRequestMethod();

const createSubject = ({
  method = DEFAULT_REQUEST_METHOD,
  resourceName = RESOURCE_NAME,
  resourceType = RESOURCE_TYPE,
  requestExecutorResult = [{ field: faker.random.word() }],
  requestExecutorError = null,
  requestExecuterMock = createMockFor(RequestExecuter, {}, {
    executeRequest: () => requestExecutorError ? throwError(requestExecutorError) : of(requestExecutorResult),
  }),
} = {}) => {
  // Declare child class as long as BaseQuery class is abstract
  class BaseQueryChild<T> extends BaseQuery<T> {
    protected readonly body = null;
    constructor(r: RequestExecuter, m: RequestMethod, t: ResourceType, d: string) {
      super(r, m, t, d);
    }
  }

  const subject = new BaseQueryChild<IUser>(requestExecuterMock, method, resourceType, resourceName);

  return {
    resourceName,
    resourceType,
    subject,
    requestExecuterMock,
    requestExecutorResult,
    requestExecutorError,
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

  it("should contain passed action", () => {
    expect((subject as any).method).toEqual(DEFAULT_REQUEST_METHOD);
  });

  it("Query should be defined", () => {
    expect((subject as any).query).toBeDefined();
  });

  it("should have resource name", () => {
    expect((subject as any).resourceName).toEqual(RESOURCE_NAME);
  });

  it("should have resource type", () => {
    expect((subject as any).resourceType).toEqual(RESOURCE_TYPE);
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
    const aggField: IAggField<IUser> = { fn: "avg", field: "age"};
    subject.fields(aggField);
    expect((subject as any).query.fields).toEqual([aggField]);
  });

  it("should accept several fields and aggregation object", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "avg", field: "age"};
    subject.fields("id", "name", aggField);
    expect((subject as any).query.fields).toEqual(["id", "name", aggField]);
  });

  it("should accept aggregation object and several fields", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "avg", field: "age"};
    subject.fields(aggField, "id", "name");
    expect((subject as any).query.fields).toEqual([aggField, "id", "name"]);
  });

  it("should accept several fields and aggregation object as an array", () => {
    const { subject } = createSubject();
    const aggField: IAggField<IUser> = { fn: "avg", field: "age"};
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
    expect(subject.compiledRequest.method).toEqual(DEFAULT_REQUEST_METHOD);
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
    const queryParams: any[] = [];
    spyOn(subject.query, "compileToQueryParams").and.returnValue(queryParams);

    expect(subject.compiledRequest.queryParams).toBe(queryParams);
  });

  it("should contain empty array for queryParams when its nullable", () => {
    const queryParams = faker.helpers.randomize([null, undefined]);
    spyOn(subject.query, "compileToQueryParams").and.returnValue(queryParams);

    expect(subject.compiledRequest.queryParams).toEqual([]);
  });

  it("should contain resource type", () => {
    expect(subject.compiledRequest.resourceType).toEqual(RESOURCE_TYPE);
  });

  it("should contain resource name", () => {
    expect(subject.compiledRequest.resourceName).toEqual(RESOURCE_NAME);
  });
});

describe("query as observable", () => {
  it("should not execute request if there is no subscriber", () => {
    const { requestExecuterMock } = createSubject();

    spyOn(requestExecuterMock, "executeRequest");

    expect(requestExecuterMock.executeRequest).not.toHaveBeenCalled();
  });

  it("should execute request once there is a subscriber", () => {
    const { subject, requestExecuterMock } = createSubject();

    spyOn(requestExecuterMock, "executeRequest").and.returnValue(of({}));

    subject.subscribe();

    expect(requestExecuterMock.executeRequest).toHaveBeenCalled();
  });

  it("should emit query execution result to the subscriber", (done) => {
    const { subject, requestExecutorResult } = createSubject();

    subject.subscribe((result) => {
      expect(result).toEqual(requestExecutorResult);
      done();
    });
  });

  it("should complete an observable once result is obtained", (done) => {
    const { subject } = createSubject();

    const completeSpy = jasmine.createSpy("completeSpy");

    subject.subscribe({ complete: () => {
      completeSpy();
      expect(completeSpy).toHaveBeenCalled();
      done();
    }});
  });

  it("should throw an error to the subscriber", (done) => {
    const { subject, requestExecutorError } = createSubject({
      requestExecutorError: new Error(faker.lorem.sentence()) as any,
    });

    subject.subscribe({ error: (error) => {
      expect(error).toEqual(requestExecutorError);
      done();
    }});
  });

  it("should execute requests as many times as many subscribers are", () => {
    const { subject, requestExecuterMock } = createSubject();
    spyOn(requestExecuterMock, "executeRequest").and.returnValue(of({}));

    const times = faker.random.number({ min: 3, max: 10 });

    for (let i = 0; i < times; i++) {
      subject.subscribe();
    }

    expect(requestExecuterMock.executeRequest).toHaveBeenCalledTimes(times);
  });
});
