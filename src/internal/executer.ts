import { Inject, Injectable } from "injection-js";
import { ClientInit } from "../api/core/client";
import { QueryAction } from "../api/core/queries/baseQuery";
import { ResourceType } from "../api/core/resource";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { API } from "../config";
import { QueryParam } from "../internal/utils";
import { IRequestExecuterData } from "./executer.interfaces";
import { IRequestOptions, Methods, RequestAdapter } from "./requestAdapter";

@Injectable()
export class RequestExecuter {
  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(ClientInit) private systemInit: Promise<any>,
    private requestAdapter: RequestAdapter,
    private tokenManager: TokenManager,
  ) { }

  public async executeRequest(request: IRequestExecuterData): Promise<any> {
    await this.systemInit;

    const URI = this.getUrl(request) + this.parseQueryParams(request);
    const options = await this.getRequestOptions(request);

    return this.requestAdapter.execute(URI, options);
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

  private async getRequestOptions(request: IRequestExecuterData): Promise<IRequestOptions> {
    const token = await this.tokenManager.token(this.config.auth);

    const options: IRequestOptions = {
      headers: { Authorization: `Bearer ${token}` },
      method: this.getMethod(request.action)
    };

    if (this.hasBody(request)) {
      options.body = request.body;
    }

    return options;
  }

  private hasBody({ action }: IRequestExecuterData): boolean {
    return ![Methods.GET, Methods.DELETE].includes(this.getMethod(action));
  }

  /**
   * Parses query params elements into query string format
   *
   * @param  queryParams
   * @returns string
   */
  private parseQueryParams({ queryParams = [] }: IRequestExecuterData): string {
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

  private getUrl({ resourceType, resourceName }: IRequestExecuterData): string {
    const endpoint = resourceType === ResourceType.Dataset ? API.DATA.ENDPOINT : API.FILES.ENDPOINT;
    return [
      `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`,
      endpoint,
      resourceName,
    ].join("/");
  }
}
