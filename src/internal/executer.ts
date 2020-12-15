import { Inject, Injectable } from "injection-js";
import { combineLatest, from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ClientInit } from "../api/core/client";
import { ResourceEndpoint } from "../api/core/resource";
import { AuthOptions, IAuthOptions, TokenManager } from "../api/core/tokenManager";
import { getApiUrl } from "../config";
import { parseQueryParams } from "../internal/utils";
import { IRequestExecuterData } from "./executer.interfaces";
import { IRequestOptions, RequestAdapter, RequestMethod } from "./requestAdapter";

@Injectable()
export class RequestExecuter {
  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(ClientInit) private systemInit: Promise<any>,
    private requestAdapter: RequestAdapter,
    private tokenManager: TokenManager,
  ) { }

  public executeRequest<T = any>(request: IRequestExecuterData): Observable<T> {
    const URI = this.getUrl(request) + parseQueryParams(request.queryParams);

    return combineLatest([
      from(this.systemInit),
      this.getRequestOptions(request),
    ]).pipe(
      switchMap(([, options]) => this.requestAdapter.execute(URI, options) as Observable<T>),
    );
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

  private getUrl({ resourceType, resourceName }: IRequestExecuterData): string {
    return [
      getApiUrl(this.config),
      ResourceEndpoint[resourceType],
      resourceName,
    ].join("/");
  }
}
