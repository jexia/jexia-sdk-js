import { Inject, Injectable } from "injection-js";
import { combineLatest, from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ClientInit } from "../api/core/client";
import { ResourceType } from "../api/core/resource";
import { AuthOptions, DEFAULT_PROJECT_ZONE, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { API } from "../config";
import { QueryParam } from "../internal/utils";
import { IRequestExecuterData } from "./executer.interfaces";
import { IRequestOptions, RequestAdapter, RequestMethod } from "./requestAdapter";

const resourceEndpoints = {
  [ResourceType.Dataset]: API.DATA.ENDPOINT,
  [ResourceType.Fileset]: API.FILES.ENDPOINT,
  [ResourceType.Channel]: API.CHANNEL.ENDPOINT,
  [ResourceType.Users]: API.UMS.ENDPOINT
};

@Injectable()
export class RequestExecuter {
  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(ClientInit) private systemInit: Promise<any>,
    private requestAdapter: RequestAdapter,
    private tokenManager: TokenManager,
  ) { }

  public executeRequest<T = any>(request: IRequestExecuterData): Observable<T> {
    const URI = this.getUrl(request) + this.parseQueryParams(request);

    return combineLatest([
      from(this.systemInit),
      this.getRequestOptions(request),
    ]).pipe(
      switchMap(([, options]) => this.requestAdapter.execute(URI, options) as Observable<T>)
    );
  }

  /**
   * The project's API URL
   */
  public get apiUrl(): string {
    const { projectID, zone } = this.config;
    return `${API.PROTOCOL}://${projectID}.${zone || DEFAULT_PROJECT_ZONE}.${API.HOST}.${API.DOMAIN}:${API.PORT}`;
  }

  private getRequestOptions(request: IRequestExecuterData): Observable<IRequestOptions> {
    return this.tokenManager.token(this.config.auth).pipe(
      map((token: string) => {
        const options: IRequestOptions = {
          headers: { Authorization: `Bearer ${token}` },
          method: request.method,
        };

        if (this.hasBody(request)) {
          options.body = request.body;
        }

        return options;
      }),
    );
  }

  private hasBody({ method }: IRequestExecuterData): boolean {
    return ![RequestMethod.GET, RequestMethod.DELETE].includes(method);
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
    return [
      this.apiUrl,
      resourceEndpoints[resourceType],
      resourceName,
    ].join("/");
  }
}
