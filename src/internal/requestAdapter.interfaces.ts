/* List of allowed methods */
export enum RequestMethod {
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
  text(): Promise<string>;
}

export interface IRequestAdapter {
  execute(uri: string, opt: IRequestOptions): Promise<any>;
}

export type Fetch = (url: string, init?: IRequestOptions) => Promise<IHTTPResponse>;
