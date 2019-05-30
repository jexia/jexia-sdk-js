// tslint:disable:no-string-literal
import * as faker from "faker";
import { createMockFor, createRequestExecuterMock, SpyObj } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { UpdateQuery } from "./updateQuery";

const createSubject = ({
  resourceName = faker.random.word(),
  resourceType = faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
  data = {},
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new UpdateQuery(requestExecuterMock, data, resourceType, resourceName);

  return {
    resourceType,
    resourceName,
    data,
    subject,
    requestExecuterMock,
  };
};

describe("QueryRequest class", () => {
  it("should be created", () => {
    const { subject } = createSubject();
    expect(subject).toBeDefined();
  });

  it("queryExecuter should be defined", () => {
    const { subject, requestExecuterMock } = createSubject();
    expect((subject as any).queryExecuter).toEqual(requestExecuterMock);
  });

  it("should assign data to body", () => {
    const { data, subject } = createSubject();
    expect((subject as any).body).toEqual(data);
  });

  it("should correct execute the query", () => {
    const { requestExecuterMock, subject} = createSubject({
      requestExecuterMock: createRequestExecuterMock() as SpyObj<RequestExecuter>,
    });
    spyOn(requestExecuterMock, "executeRequest");
    subject.execute();
    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(subject["compiledRequest"]);
  });
});
