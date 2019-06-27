import { Logger } from "../api/logger/logger";
import { MESSAGE } from "../config";
import { Fetch, IHTTPResponse, IRequestAdapter, IRequestOptions, RequestMethod } from "./requestAdapter.interfaces";

function status(response: IHTTPResponse): Promise<IHTTPResponse> {
  if (!response.ok) {
    throw new Error(`${MESSAGE.CORE.BACKEND_ERROR}${response.status} ${response.statusText}`);
  }
  return Promise.resolve(response);
}

function json(response: IHTTPResponse): Promise<any> {
  // parses response body into JSON or return an empty object when it's empty
  return response.text().then((text) => text ? JSON.parse(text) : {});
}
export class RequestAdapter implements IRequestAdapter {

  private logger: Logger = new Logger();

  constructor(private fetch: Fetch) {}

  public provideLogger(logger: Logger) {
    this.logger = logger;
  }

  public execute<T = any>(uri: string, opt: IRequestOptions): Promise<T> {
    let logMessage = `(REQUEST) ${opt.method} ${uri} ${JSON.stringify(opt)}\n`;
    return this.fetch(uri, {body: JSON.stringify(opt.body), headers: opt.headers, method: opt.method})
      .then((response) => {
        logMessage += `(RESPONSE) ${response.status} ${response.statusText}`;
        this.logger.debug("RequestAdapter", logMessage);
        return response;
      })
      /* check response status */
      .then(status)
      /* convert body to JSON */
      .then(json);
  }

  /**
   * Upload a file
   * @param uri
   * @param headers
   * @param body
   */
  public upload<T = any>(uri: string, headers: {[header: string]: string}, body: any): Promise<T> {
    let logMessage = `(REQUEST) UPLOAD ${uri}\n`;
    return this.fetch(uri, { body, headers, method: RequestMethod.POST })
      .then((response) => {
        logMessage += `(RESPONSE) ${response.status} ${response.statusText}`;
        this.logger.debug("RequestAdapter", logMessage);
        return response;
      })
      /* check response status */
      .then(status)
      /* convert body to JSON */
      .then(json);
  }
}

export * from "./requestAdapter.interfaces";
