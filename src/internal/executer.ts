import { TokenManager } from "../api/core/tokenManager";
import { ICompiledRequest } from "./queryBasedCompiler";
import { IRequestAdapter, IRequestOptions, Methods } from "./requestAdapter";
import { API } from '../config/config';

export class RequestExecuter {
  constructor(private appUrl: string,
              private dataSetName: string,
              private schemaName: string,
              private requestAdapter: IRequestAdapter,
              private tokenManager: TokenManager) {}

  public executeRequest(options: ICompiledRequest): Promise<any> {
    let requestUrl: string = this.getRequestUrl();
    return this.tokenManager.token.then( (token: string) => {
      let reqOpt: IRequestOptions = {headers: { Authorization: token}, body: options, method: Methods.POST };
      return this.requestAdapter.execute(requestUrl, reqOpt);
    });
  }

  private getRequestUrl(): string {
    return `${API.PROTOCOL}://${this.appUrl}:${API.PORT}/${API.SDKAPI}/${this.schemaName}/${this.dataSetName}`;
  }
}
