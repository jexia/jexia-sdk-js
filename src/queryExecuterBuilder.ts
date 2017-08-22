import { RequestExecuter } from "./executer";
import { IRequestAdapter } from "./requestAdapter";
import { TokenManager } from "./tokenManager";

export class QueryExecuterBuilder {
  constructor(private appUrl: string, private requestAdapter: IRequestAdapter, private tokenManager: TokenManager) {  }

  public createQueryExecuter(schemaName: string, dataSetName: string): RequestExecuter {
    return new RequestExecuter(this.appUrl, dataSetName, schemaName, this.requestAdapter, this.tokenManager);
  }
}
