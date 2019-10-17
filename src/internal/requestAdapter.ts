import { Logger } from "../api/logger/logger";
import {
  Fetch,
  IHTTPResponse,
  IRequestAdapter,
  IRequestError,
  IRequestOptions,
  RequestMethod
} from "./requestAdapter.interfaces";

export class RequestAdapter implements IRequestAdapter {

  private logger: Logger = new Logger();

  constructor(private fetch: Fetch) {}

  public provideLogger(logger: Logger) {
    this.logger = logger;
  }

  public execute<T = any>(uri: string, opt: IRequestOptions): Promise<T> {
    let logMessage = `(REQUEST) ${opt.method} ${uri} ${JSON.stringify(opt)}\n`;
    const requestOptions: IRequestOptions = {
      body: JSON.stringify(opt.body),
      headers: opt.headers,
      method: opt.method
    };
    return this.fetch(uri, requestOptions)
      .then((response) => {
        logMessage += `(RESPONSE) ${response.status} ${response.statusText}`;
        this.logger.debug("RequestAdapter", logMessage);
        return response;
      })
      /* check response status */
      .then((response) => this.handleResponse(response, opt));
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
      .then((response) => this.handleResponse(response,
        { body, headers, method: RequestMethod.POST }));
  }

  /**
   * Analyze response and reject promise with IRequestError object if there is an error
   * @internal
   */
  private handleResponse<T = any>(response: IHTTPResponse, request: IRequestOptions): Promise<T> {
    return response.text().then((responseBody: string) => {
      if (response.ok) {
        return responseBody ? JSON.parse(responseBody) : {};
      }
      const error: IRequestError = {
        ...this.fetchErrorMessage(responseBody),
        request,
        httpStatus: {
          code: response.status,
          status: response.statusText
        }
      };

      return Promise.reject(error);
    });
  }

  /**
   * Fetch id and message from the body of the error response
   * @internal
   */
  private fetchErrorMessage(body: string): { id: string; message: string } {
    let id: string = "";
    let message: string;
    try {
      /* there is always an array of errors but only the first matters */
      const [ parsedBody ] = JSON.parse(body);
      if (parsedBody.request_id) {
        id = parsedBody.request_id;
      }
      message = parsedBody.message || parsedBody;
    } catch (_) {
      message = body;
    }
    return { id, message };
  }
}

export * from "./requestAdapter.interfaces";
