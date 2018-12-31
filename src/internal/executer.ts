import { Inject, Injectable } from "injection-js";
import { ClientInit } from "../api/core/client";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { DataSetName } from "../api/dataops/dataops.tokens";
import { QueryAction } from "../api/dataops/queries/baseQuery";
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

  public async executeRequest(request: any): Promise<any> {
    await this.systemInit;
    const token = await this.tokenManager.token;
    return this.requestAdapter.execute(
      this.getUrl(),
      { headers: { Authorization: `Bearer ${token}` }, body: request, method: this.getMethod(request.action) },
    );
  }

  private getUrl(): string {
    return [
      `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`,
      API.DATA.ENDPOINT,
      this.dataSetName,
    ].join("/");
  }

  private getMethod(action: QueryAction): Methods {
    switch (action) {
      default:
      case QueryAction.insert: return Methods.POST;
      case QueryAction.delete: return Methods.DELETE;
      case QueryAction.select: return Methods.GET;
      case QueryAction.update: return Methods.PATCH;
    }
  }
}
