// tslint:disable:no-string-literal
import { createMockFor, createRequestExecuterMock } from "../../../../spec/testUtils";
import { RequestExecuter } from "../../../internal/executer";
import { compileDataRequest } from "../../../internal/queryBasedCompiler";
import { QueryAction } from "./baseQuery";
import { DeleteQuery } from "./deleteQuery";

let createSubject = ({
  datasetName = "dataset",
  requestExecuterMock = createMockFor(RequestExecuter),
} = {}) => {
  const subject = new DeleteQuery(requestExecuterMock, datasetName);

  return {
    datasetName,
    subject,
    requestExecuterMock,
  };
};

describe("QueryRequest class", () => {
  let projectID: string;
  let dataset: string;

  beforeAll(() => {
    dataset = "dataset";
    projectID = "projectID";
  });

  it("should be created", () => {
    const { subject } = createSubject();
    expect(subject).toBeDefined();
  });

  it("queryExecuter should be defined", () => {
    const { subject, requestExecuterMock } = createSubject();
    expect((subject as any).queryExecuter).toEqual(requestExecuterMock);
  });

  it("should correct execute the query", () => {
    let qe = createRequestExecuterMock(projectID, dataset);
    let subject: any = new DeleteQuery(qe, dataset);
    let compiledRequest = compileDataRequest({
      action: QueryAction.delete,
      query: subject["query"],
      records: subject["records"],
    });
    spyOn(subject["queryExecuter"], "executeRequest");
    subject.execute();
    expect(subject["queryExecuter"].executeRequest).toHaveBeenLastCalledWith(compiledRequest);
  });
});
