import { Inject, Injectable } from "injection-js";
import { ClientInit } from "../api/core/client";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { DataSetName } from "../api/dataops/dataops.tokens";
import { QueryAction } from "../api/dataops/queries/baseQuery";
import { API } from "../config";
import { IRequestExecuterData, QueryParam } from "./executer.interfaces";
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

  public async executeRequest(request: IRequestExecuterData): Promise<any> {
    await this.systemInit;
    const token = await this.tokenManager.token(this.config.auth);
    return this.requestAdapter.execute(
      this.getURI(request.queryParams),
      {
        headers: { Authorization: `Bearer ${token}` },
        body: request.body,
        method: this.getMethod(request.action)
      },
    );
  }

  public getMethod(action: QueryAction): Methods {
    switch (action) {
      default:
      case QueryAction.insert: return Methods.POST;
      case QueryAction.delete: return Methods.DELETE;
      case QueryAction.select: return Methods.GET;
      case QueryAction.update: return Methods.PATCH;
    }
  }

  /**
   * Gets the URL concatenated with query params, when available.
   *
   * @param  queryParams
   * @returns string
   */
  private getURI(queryParams: QueryParam[] = []): string {
    return this.getUrl() + this.parseQueryParams(queryParams);
  }

  /**
   * Parses query params elements into query string format
   *
   * @param  queryParams
   * @returns string
   */
  private parseQueryParams(queryParams: QueryParam[]): string {
    if (!queryParams.length) {
      return "";
    }

    const encodeValue = (v: any) => encodeURIComponent(
      typeof v === "string" ? v : JSON.stringify(v)
    );
    const toQueryParam = ({ key, value }: QueryParam) => `${key}=${encodeValue(value)}`;

    return "?" + queryParams
      .map(toQueryParam)
      .join("&");
  }

  private getUrl(): string {
    return [
      `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`,
      API.DATA.ENDPOINT,
      this.dataSetName,
    ].join("/");
  }
}
