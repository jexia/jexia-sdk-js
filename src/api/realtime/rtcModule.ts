import { API } from "../../config/config";
import { MESSAGE } from "../../config/message";
import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { IResource } from "../core/resource";

export class RTCModule implements IModule {
  private websocket: WebSocket;
  private websocketCreateCallback: Function;
  private messageReceivedCallback: Function;
  private callStack: any = {};

  constructor(messageReceivedCallback: Function, websocketCreateCallback?: Function) {
    this.messageReceivedCallback = messageReceivedCallback;
    if (websocketCreateCallback) {
      this.websocketCreateCallback = websocketCreateCallback;
    } else {
      this.websocketCreateCallback = (appUrl: string) => new WebSocket(appUrl);
    }
  }

  public init(projectID: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<RTCModule> {
    return tokenManager.token.then( (token) => {
      try {
        this.websocket = this.websocketCreateCallback(this.buildSocketOpenUri(projectID, token));
      } catch (error) {
        throw new Error(`${MESSAGE.RTC.ERROR_CREATING_WEBSOCKET} Original error: ${error.message}`);
      }

      if (!this.websocket) {
        return Promise.reject(MESSAGE.RTC.BAD_WEBSOCKET_CREATION_CALLBACK);
      }

      this.websocket.onmessage = (message: MessageEvent) => {
        const messageData = JSON.parse(message.data);
        if (messageData.type === "event") {
          try {
            this.messageReceivedCallback({ data: messageData.data, event: messageData.nsp });
          } catch (err) {
            throw new Error(`${MESSAGE.RTC.EXCEPTION_IN_CLIENT_CALLBACK}${err.stack}`);
          }
        } else if (messageData.type === "subscribe") {
          this.pendingSubscriptionRequests().forEach((functionMessage) => {
            this.callStack[functionMessage](message);
          });
        }
      };
      return new Promise((resolve, reject) => {
        this.websocket.onopen = () => {
          resolve();
        };
        this.websocket.onerror = (err: Event) => {
          reject(new Error(`${MESSAGE.RTC.CONNECTION_FAILED}`));
        };
        this.websocket.onclose = (event: CloseEvent) => {
          reject(new Error(`${MESSAGE.RTC.CONNECTION_CLOSED}${event.code}`));
        };
      }).then( () => this);
    });
  }

  public pendingSubscriptionRequests(): string[] {
    return Object.getOwnPropertyNames(this.callStack);
  }

  public subscribe(method: string, resource: IResource) {
    return this.subscription("subscribe", method, resource.name);
  }

  public unsubscribe(method: string, resource: IResource) {
    return this.subscription("unsubscribe", method, resource.name);
  }

  public terminate() {
    return new Promise( (resolve, reject) => {
      this.websocket.onclose = () => resolve();
      this.websocket.onerror = (err) => {
        reject(err);
      };
      this.websocket.close();
    });
  }

  private associateMethod(method: string) {
    switch (method) {
      case "insert":
        return "post";
      case "select":
        return "get";
      case "update":
        return "put";
      default:
        return method;
    }
  }

  private subscription(type: string, method: string, resourceName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let nsp = this.buildSubscriptionUri(method, resourceName);
      this.callStack[nsp] = (message: MessageEvent) => {
        const response = JSON.parse(message.data);
        if (response.type === type && response.status === "success" && response.nsp === nsp) {
          delete this.callStack[nsp];
          resolve(message);
        } else if (response.type === type && response.status === "failure" && response.nsp === nsp) {
          delete this.callStack[nsp];
          reject(new Error("Error trying to ${type}"));
        }
      };
      this.send({type, nsp});
    });
  }

  private send(message: object) {
    if (!this.websocket) {
      throw new Error(MESSAGE.RTC.NO_WESBSOCKET_PRESENT);
    }
    try {
      this.websocket.send(JSON.stringify(message));
    } catch (error) {
      if  (error.message === MESSAGE.RTC.NOT_OPEN_ERROR) {
        throw new Error(MESSAGE.RTC.NOT_OPEN_MESSAGE);
      }
      throw new Error(error);
    }
  }

  private buildSubscriptionUri(method: string, resourceName: string) {
    return `${resourceName}.${this.associateMethod(method)}`;
  }

  private buildSocketOpenUri(projectID: string, token: string) {
    // the realtime port and endpoint are not always needed in all environments
    // where the SDK can run (local dev vs. cloud dev vs. production), so to avoid
    // complicated logic we can simply define them as empty string when they are not
    // needed and include : or / along with the actual values, when they are needed.
    // See /config/config.ts vs. /config/config.prod.ts for actual values.
    let result = `${API.REAL_TIME.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
      `${API.REAL_TIME.PORT}${API.REAL_TIME.ENDPOINT}/${token}`;
    // temporary variable used for devenv debugging purposes
    return result;
  }
}
