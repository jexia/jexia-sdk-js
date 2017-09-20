import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { Dataset } from "../dataops/dataset";

const NOT_OPEN_ERROR = "not opened";
// tslint:disable-next-line:max-line-length
const NOT_OPEN_MESSAGE = "The connection seems to be closed. Did you properly initialize the RTC Module by calling the init method? Or maybe you terminated the RTC Module early?";
const NO_WESBSOCKET_PRESENT = "The RTC Module seems to be missing a valid websocket object. Did you properly initialize the RTC Module by calling the init method?";
// tslint:disable-next-line:max-line-length
const BAD_WEBSOCKET_CREATION_CALLBACK = "The websocket creation function you supplied did not return a valid websocket object.";
// tslint:disable-next-line:max-line-length
const ERROR_CREATING_WEBSOCKET = "The callback you supplied for websocket creation threw an error. You might want to call it yourself and debug it to see what's wrong.";

export class RTCModule implements IModule {
  private websocket: WebSocket;
  private appUrl: string;
  private websocketCreateCallback: Function;
  private messageReceivedCallback: Function;

  constructor(messageReceivedCallback: Function, websocketCreateCallback?: Function) {
    this.messageReceivedCallback = messageReceivedCallback;
    if (websocketCreateCallback) {
      this.websocketCreateCallback = websocketCreateCallback;
    } else {
      this.websocketCreateCallback = (appUrl: string) => new WebSocket(appUrl);
    }
  }

  public init(appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<RTCModule> {
    this.appUrl = appUrl;
    return tokenManager.token.then( (token) => {
      try {
        this.websocket = this.websocketCreateCallback(this.buildSocketOpenUri(appUrl, token));
      } catch (error) {
        throw new Error(`${ERROR_CREATING_WEBSOCKET} Original error: ${error.message}`);
      }

      if (!this.websocket) {
        return Promise.reject(BAD_WEBSOCKET_CREATION_CALLBACK);
      }

      this.websocket.onmessage = (message: MessageEvent) => {
        this.messageReceivedCallback(message.data);
      };
      return new Promise((resolve, reject) => {
        this.websocket.onopen = () => {
          resolve();
        };
        this.websocket.onerror = (err) => {
          reject(err);
        };
      }).then( () => this);
    });
  }

  public subscribe(method: string, dataset: Dataset) {
    this.send({type: "subscribe", nsp: this.buildSubscriptionUri(method, dataset.schema, dataset.name)});
  }

  public unsubscribe(method: string, dataset: Dataset) {
    this.send({type: "unsubscribe", nsp: this.buildSubscriptionUri(method, dataset.schema, dataset.name)});
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

  private send(message: object) {
    if (!this.websocket) {
      throw new Error(NO_WESBSOCKET_PRESENT);
    }
    try {
      this.websocket.send(JSON.stringify(message));
    } catch (error) {
      if  (error.message === NOT_OPEN_ERROR) {
        throw new Error(NOT_OPEN_MESSAGE);
      }
      throw new Error(error);
    }
  }

  private buildSubscriptionUri(method: string, schema: string, datasetName: string) {
    return `rest.${method}.${schema}.${datasetName}`;
  }

  private buildSocketOpenUri(appUrl: string, token: string) {
    return `ws://${appUrl}:8082/${token}`;
  }
}
