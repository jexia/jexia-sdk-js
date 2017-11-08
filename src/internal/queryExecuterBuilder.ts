import { TokenManager } from "../api/core/tokenManager";
import { RequestExecuter } from "./executer";
import { IRequestAdapter } from "./requestAdapter";

export class QueryExecuterBuilder {
  constructor(
    private projectID: string,
    private requestAdapter: IRequestAdapter,
    private tokenManager: TokenManager,
  ) {  }

  public createQueryExecuter(dataSetName: string): RequestExecuter {
    return new RequestExecuter(this.projectID, dataSetName, this.requestAdapter, this.tokenManager);
  }
}
