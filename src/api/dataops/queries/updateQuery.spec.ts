// tslint:disable:no-string-literal
import { createMockFor, createRequestExecuterMock } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { UpdateQuery } from "./updateQuery";

let createSubject = ({
  datasetName = "dataset",
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new UpdateQuery(requestExecuterMock, {}, datasetName);

  return {
    datasetName,
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

  it("data should be saved", () => {
    const { subject } = createSubject();
    expect((subject as any).query.data).toEqual({});
  });

  it("should correct execute the query", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let subject: any = new UpdateQuery(qe, [{ title: "Another first post", user_id: 1 }], dataset);
    spyOn(subject["queryExecuter"], "executeRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeRequest).toHaveBeenLastCalledWith(subject.compiledRequest);
  });
});
