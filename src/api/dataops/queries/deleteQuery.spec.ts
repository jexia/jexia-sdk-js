import * as faker from "faker";
import { createMockFor } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { QueryAction } from "./baseQuery";
import { DeleteQuery } from "./deleteQuery";

const createSubject = ({
  datasetName = faker.random.word(),
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new DeleteQuery(requestExecuterMock, datasetName);

  return {
    datasetName,
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

  it("should contain delete as requet", () => {
    const { subject } = createSubject();
    expect(subject.action).toBe(QueryAction.delete);
  });
});
