import { MESSAGE } from "../config";

/* List of allowed methods */
export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export interface IRequestOptions extends RequestInit {
  body?: any;
}

export interface IHTTPResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<any>;
}

function status(response: IHTTPResponse): Promise<IHTTPResponse> {
  if (!response.ok) {
    throw new Error(`${MESSAGE.CORE.BACKEND_ERROR}${response.status} ${response.statusText}`);
  }
  return Promise.resolve(response);
}

function json(response: IHTTPResponse): Promise<any> {
  /* convert response to JSON */
  return response.json();
}

export interface IRequestAdapter {
  execute(uri: string, opt: IRequestOptions): Promise<any>;
}

export type Fetch = (url: string, init?: IRequestOptions) => Promise<IHTTPResponse>;

export class RequestAdapter implements IRequestAdapter {
  constructor(private fetch: Fetch) {}

  public execute(uri: string, opt: IRequestOptions): Promise<any> {

    /* TODO mock response, remove after having BE ready */
    if (opt.method === Methods.POST && uri.includes("/ds/r/")) {
      return new Promise((resolve, reject) => {
        let records = opt.body;

        if (!Array.isArray(records)) {
          reject({
            errors: ["Incorrect records array"]
          });
        } else {
          resolve(records.map((record: any) => ({
            ...record,
            id: "some random mocked id",
            created_at: new Date().toJSON(),
            updated_at: new Date().toJSON()
          })));
        }
      });
    }

    return this.fetch(uri, {body: JSON.stringify(opt.body), headers: opt.headers, method: opt.method})
      /* check response status */
      .then(status)
      /* convert body to JSON */
      .then(json);
  }
}
