import * as faker from "faker";
import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { QueryAction } from "./baseQuery";
import { DeleteQuery } from "./deleteQuery";

const createSubject = ({
  resourceName = faker.random.word(),
  resourceType = faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
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
    expect((subject as any).action).toBe(QueryAction.delete);
  });
});
