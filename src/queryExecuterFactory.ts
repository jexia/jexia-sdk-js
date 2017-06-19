import { QueryExecuter } from "./queryExecuter";
import { IRequestAdapter } from "./requestAdapter";
import { TokenManager } from "./tokenManager";

export class QueryExecuterFactory {
  constructor(private appUrl: string, private requestAdapter: IRequestAdapter, private tokenManager: TokenManager) {  }

  public createQueryExecuter(dataSetName: string, schemaName: string): QueryExecuter {
    return new QueryExecuter(this.appUrl, dataSetName, schemaName, this.requestAdapter, this.tokenManager);
  }
}
