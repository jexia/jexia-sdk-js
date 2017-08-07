import { strEnum } from "./utils";

/* List of allowed methods */
export const Methods = strEnum(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);
/* request method string based enum type */
type Method = keyof typeof Methods;

export interface IRequestOptions {
  /* request method (optional) */
  method?: Method;
  /* headers (optional) */
  headers?: Object;
  /* body (optional) */
  body?: Object;
}

interface IServerErrors {
  /* array of errors (from server) */
  errors: string[];
}

export interface IHTTPResponse {
  ok: boolean;
  status: number;
  json(): Promise<any>;
}

function status(response: IHTTPResponse): Promise<IHTTPResponse> {
  if (!response.ok) {
    /* the fetch request went through but we received an error from the server */
    return response.json().then((errList: IServerErrors) => {
      throw new Error(`Server didn't like it: ${errList.errors[0]}`);
    });
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

export class RequestAdapter implements IRequestAdapter {
  constructor(private fetch: Function) {}

  public execute(uri: string, opt: IRequestOptions): Promise<any> {
    console.log(`${opt.method} to ${uri} with body ${JSON.stringify(opt.body)}`);
    return this.fetch(uri, {body: JSON.stringify(opt.body), headers: opt.headers, method: opt.method})
      /* check response status */
      .then(status)
      /* convert body to JSON */
      .then(json);
  }
}
