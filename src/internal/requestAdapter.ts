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

    return this.fetch(uri, {body: JSON.stringify(opt.body), headers: opt.headers, method: opt.method})
      /* check response status */
      .then(status)
      /* convert body to JSON */
      .then(json);
  }
}
