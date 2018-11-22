import { Inject, Injectable } from "injection-js";
import { ClientInit } from "../api/core/client";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { DataSetName } from "../api/dataops/dataops.tokens";
import { API } from "../config";
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

  public async executeRestRequest<T, D>(method = Methods.GET, records?: T[]): Promise<D[]> {
    await this.systemInit;
    const token = await this.tokenManager.token;
    return this.requestAdapter.execute(
      this.getUrl(),
      { headers: { Authorization: `Bearer ${token}` }, method, ...(records ? { body: records } : {}) });
  }

  public async executeQueryRequest(request: any): Promise<any> {
    await this.systemInit;
    const token = await this.tokenManager.token;
    return this.requestAdapter.execute(
      this.getUrl(true),
      { headers: { Authorization: `Bearer ${token}` }, body: request, method: Methods.POST },
    );
  }

  private getUrl(query: boolean = false): string {
    return [
      `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`,
      query ? API.DATA.ENDPOINT.QUERY : API.DATA.ENDPOINT.REST,
      this.dataSetName,
    ].join("/");
  }
}
