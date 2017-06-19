import { IRequestAdapter, IRequestOptions, Methods } from "./requestAdapter";
import { TokenManager } from "./tokenManager";

const apiEndpoint = "sdk-api";

export class QueryExecuter {
  constructor(private appUrl: string,
              private dataSetName: string,
              private schemaName: string,
              private requestAdapter: IRequestAdapter,
              private tokenManager: TokenManager) {}

  public executeQuery(queryOptions: any): Promise<any> {
    let requestUrl: string = this.getRequestUrl();
    return this.tokenManager.token.then( (token: string) => {
      let reqOpt: IRequestOptions = {headers: { Authorization: token}, body: queryOptions, method: Methods.POST };
      return this.requestAdapter.execute(requestUrl, reqOpt);
    });
  }

  private getRequestUrl(): string {
    return `${this.appUrl}/${apiEndpoint}/${this.schemaName}/${this.dataSetName}`;
  }
}
