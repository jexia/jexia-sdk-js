import { TokenManager } from "./tokenManager";

export interface IHTTPResponse {
  ok: boolean;
  json(): Promise<any>;
}

export class QueryRequestAdapter {
  private fetch: Function;
  private appUrl: string;
  private tokenManager: TokenManager;

  constructor(fetch: Function, appUrl: string, tokenManager: TokenManager) {
    this.fetch = fetch;
    this.appUrl = appUrl;
    this.tokenManager = tokenManager;
  }

  public executeQuery(dataSetSchema: string, resourceName: string, queryOptions: Object): Promise<any> {
    return this.fetch(this.buildQueryRequestUrl(this.appUrl, dataSetSchema, resourceName),
        {method: "POST", body: JSON.stringify(queryOptions), headers: this.tokenManager.getAuthorizationHeader() },
      ).then( (res: IHTTPResponse) => {
        if (!res.ok) {
          // the fetch request went through but we received an error from the server
          return res.json().then( (body: any) => {
            throw new Error(body.errors[0]);
          });
        }
        return res.json();
      });
  }

  private buildQueryRequestUrl(appUrl: string, schema: string, resource: string): string {
    return `${appUrl}/sdk-api/${schema}/${resource}`;
  }
}
