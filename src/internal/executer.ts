import { Inject, Injectable } from "injection-js";
import { ClientInit } from "../api/core/client";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { DataSetName } from "../api/dataops/dataops.tokens";
import { API } from "../config";
import { ICompiledRequest } from "./queryBasedCompiler";
import { Methods, RequestAdapter } from "./requestAdapter";

@Injectable()
export class RequestExecuter {
  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(DataSetName) private dataSetName: string,
    @Inject(ClientInit) private systemInit: Promise<any>,
    private requestAdapter: RequestAdapter,
    private tokenManager: TokenManager,
  ) { }

  public async executeRequest(options: ICompiledRequest): Promise<any> {
    await this.systemInit;
    const token = await this.tokenManager.token;
    return this.requestAdapter.execute(
      this.getRequestUrl(),
      { headers: { Authorization: token }, body: options, method: Methods.POST },
    );
  }

  private getRequestUrl(): string {
    return `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.` +
      `${API.DOMAIN}:${API.PORT}/${API.DATA.ENDPOINT}/${this.dataSetName}`;
  }
}
