import { ReflectiveInjector } from "injection-js";
import { API, MESSAGE } from "../../config";
import { IModule, ModuleConfiguration } from "../core/module";
import { IResource } from "../core/resource";
import { AuthOptions, IAuthOptions, TokenManager } from "../core/tokenManager";
import { Dataset } from "../dataops/dataset";
import { IFormData } from "../fileops/fileops.interfaces";
import { Fileset } from "../fileops/fileset";
import { IWebSocket, IWebSocketBuilder, WebSocketState } from "./realTime.interfaces";
import * as setWatch from "./watch";

/**
 * List of resources that will be extended by RTC module
 * by providing a watch() method to their prototypes
 */
const RTCResources: Array<{ new(...args: any[]): IResource }> = [Dataset, Fileset];

declare module "../dataops/dataset" {
  /**
   * @ignore
   */ // tslint:disable-next-line:interface-name
  interface Dataset<T> {
    webSocket: IWebSocket;
    watch: typeof setWatch.watch;
  }
}

declare module "../fileops/fileset" {
  /**
   * @ignore
   */ // tslint:disable-next-line:interface-name
  interface Fileset<FormDataType extends IFormData<F>, T, D, F> {
    webSocket: IWebSocket;
    watch: typeof setWatch.watch;
  }
}

/**
 * Real Time Module used to work with realtime events from datasets and filesets.
 * This object must be build from the helper functions, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * import { jexiaClient, dataOperations, realTime } from "jexia-sdk-js/node";
 *
 * const dataModule = dataOperations();
 * const realTimeModule = realTime();
 *
 * jexiaClient().init(credentials, dataModule, realTimeModule);
 *
 * dataModule.dataset("posts")
 *   .watch()
 *   .subscribe(e => console.log(e));
 * ```
 */
export class RealTimeModule implements IModule {
  private websocket: IWebSocket;

  /**
   * @internal
   */
  constructor(
    private websocketBuilder: IWebSocketBuilder,
  ) { }

  /**
   * @internal
   */
  public init(
    coreInjector: ReflectiveInjector,
  ): Promise<this> {
    const tokenManager: TokenManager = coreInjector.get(TokenManager);
    const { projectID }: IAuthOptions = coreInjector.get(AuthOptions);

    RTCResources.forEach((resource) => resource.prototype.watch = setWatch.watch);

    return tokenManager.token().then((token) => {
      try {
        this.websocket = this.websocketBuilder(this.buildSocketOpenUri(projectID, token));
      } catch (error) {
        throw new Error(`${MESSAGE.RTC.ERROR_CREATING_WEBSOCKET} Original error: ${error.message}`);
      }

      if (!this.websocket) {
        throw new Error(MESSAGE.RTC.BAD_WEBSOCKET_CREATION_CALLBACK);
      }

      RTCResources.forEach((resource) => resource.prototype.webSocket = this.websocket);

      return new Promise((resolve, reject) => {
        this.websocket.onopen = resolve;
        this.websocket.onerror = () => reject(new Error(MESSAGE.RTC.CONNECTION_FAILED));
      });
    })
    .then(() => setWatch.start(this.websocket, () => tokenManager.token()))
    .then(() => this);
  }

  /**
   * Return configuration
   */
  public getConfig(): { [moduleName: string]: ModuleConfiguration } {
    return { rtc: {} };
  }

  /**
   * @internal
   */
  public terminate(): Promise<this> {
    if (this.websocket.readyState === WebSocketState.CLOSED) {
      return Promise.resolve(this);
    }
    return new Promise((resolve, reject) => {
      this.websocket.onclose = () => resolve(this);
      this.websocket.onerror = (err) => reject(err);
      this.websocket.close();
    });
  }

  private buildSocketOpenUri(projectID: string, token: string) {
    // the realtime port and endpoint are not always needed in all environments
    // where the SDK can run (local dev vs. cloud dev vs. production), so to avoid
    // complicated logic we can simply define them as empty string when they are not
    // needed and include : or / along with the actual values, when they are needed.
    // See /config/config.ts vs. /config/config.prod.ts for actual values.
    let result = `${API.REAL_TIME.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
      `${API.REAL_TIME.PORT || ""}${API.REAL_TIME.ENDPOINT}?access_token=${token}`;
    // temporary variable used for devenv debugging purposes
    return result;
  }
}
