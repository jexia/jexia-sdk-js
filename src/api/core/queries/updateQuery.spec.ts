// tslint:disable:no-string-literal
import * as faker from "faker";
import { createMockFor, createRequestExecuterMock, SpyObj } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { UpdateQuery } from "./updateQuery";

const createSubject = ({
  datasetName = faker.random.word(),
  data = {},
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new UpdateQuery(requestExecuterMock, data, datasetName);

  return {
    datasetName,
    data,
    subject,
    requestExecuterMock,
  };
};

describe("QueryRequest class", () => {
  const projectID = "projectID";
  const dataset = "dataset";

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
    expect(subject.body).toEqual(data);
  });

  it("should correct execute the query", () => {
    const { requestExecuterMock, subject} = createSubject({
      requestExecuterMock: createRequestExecuterMock(projectID, dataset) as SpyObj<RequestExecuter>,
    });
    spyOn(requestExecuterMock, "executeRequest");
    subject.execute();
    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(subject["compiledRequest"]);
  });
});
