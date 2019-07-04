import * as faker from "faker";
import { createMockFor, getRandomResourceType } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { DeleteQuery } from "./deleteQuery";

const createSubject = ({
  resourceName = faker.random.word(),
  resourceType = getRandomResourceType(),
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new DeleteQuery(requestExecuterMock, resourceType, resourceName);

  return {
    resourceName,
    resourceType,
    subject,
    requestExecuterMock,
  };
};

describe("DeleteQuery class", () => {
  it("should be created", () => {
    const { subject } = createSubject();
    expect(subject).toBeDefined();
  });

  it("queryExecuter should be defined", () => {
    const { subject, requestExecuterMock } = createSubject();
    expect((subject as any).queryExecuter).toEqual(requestExecuterMock);
  });

  it("should contain delete as request", () => {
    const { subject } = createSubject();
    expect((subject as any).method).toBe(RequestMethod.DELETE);
  });
});
