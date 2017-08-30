import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { Dataset } from "../dataops/dataset";

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
      this.websocket = this.websocketCreateCallback(this.buildSocketOpenUri(appUrl, token));
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

  private send(message: object) {
    this.websocket.send(JSON.stringify(message));
  }

  private buildSubscriptionUri(method: string, schema: string, datasetName: string) {
    return `rest.${method}.${schema}.${datasetName}`;
  }

  private buildSocketOpenUri(appUrl: string, token: string) {
    return `ws://${appUrl}:8082/${token}`;
  }
}
