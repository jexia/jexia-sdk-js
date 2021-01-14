import { ReflectiveInjector } from "injection-js";
import { catchError, filter, tap } from "rxjs/operators";
import { of } from "rxjs";
import { MESSAGE, getRtcUrl } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { IModule, ModuleConfiguration } from "../core/module";
import { IResource } from "../core/resource";
import { Dispatcher, DispatchEvents } from "../core/dispatcher";
import { AuthOptions, IAuthOptions, TokenManager } from "../core/tokenManager";
import { Dataset } from "../dataops/dataset";
import { IFormData } from "../fileops/fileops.interfaces";
import { Fileset } from "../fileops/fileset";
import { Channel } from "./channel";
import { IWebSocket, IWebSocketBuilder, WebSocketState } from "./realTime.interfaces";
import { watch } from "./watch";
import * as websocket from "./websocket";

/**
 * List of resources that will be extended by RTC module
 * by providing a watch() method to their prototypes
 */
const RTCResources: Array<new(...args: any[]) => IResource> = [Dataset, Fileset];

declare module "../dataops/dataset" {
  /**
   * @ignore
   */
  interface Dataset<T> {
    webSocket: IWebSocket;
    watch: typeof watch;
  }
}

declare module "../fileops/fileset" {
  /**
   * @ignore
   */
  interface Fileset<FormDataType extends IFormData<F>, T, D, F> {
    webSocket: IWebSocket;
    watch: typeof watch;
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
  private injector: ReflectiveInjector;
  private websocket: IWebSocket;
  private dispatcher: Dispatcher;
  private tokenManager: TokenManager;

  /* marker for when the tokens are given in the jexiaClient().init() */
  private tokensGivenOnInit = false;

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
    this.injector = coreInjector.resolveAndCreateChild([
      RequestExecuter,
    ]);

    this.dispatcher = this.injector.get(Dispatcher);
    this.tokenManager = this.injector.get(TokenManager);

    RTCResources.forEach((resource) => resource.prototype.watch = watch);

    // add the events listeners
    this.listenToEvents();

    // when there is a token, e.g. when a user refresh, then connect with the current available token
    this.connectWhenTokenIsAvailable();

    return Promise.resolve(this);
  }

  /**
   * Connect when there is a token.
   * Mostly this is the case when a user refresh the page and already got the tokens available.
   *
   * TODO move this part to the connect function after migrating the connect() function to RXJS and remove promises
   *
   * @internal
   */
  private connectWhenTokenIsAvailable(): void {
    this.tokenManager.token().pipe(
      catchError(() => of("")),
      filter(token => token !== ""),
      tap(async () => await this.connect()),
    ).subscribe();
  }

  /**
   * Return configuration
   * @internal
   */
  public getConfig(): { [moduleName: string]: ModuleConfiguration } {
    return { rtc: {} };
  }

  /**
   * Return a channel
   * @param {string} name Name of the channel
   */
  public channel<T = any>(name: string): Channel<T> {
    return new Channel<T>(this.injector, () => this.websocket, name);
  }

  /**
   * @internal
   */
  public terminate(): Promise<this> {
    if (!this.websocket || this.websocket.readyState === WebSocketState.CLOSED) {
      return Promise.resolve(this);
    }

    const closedConnectionPromise = this.closeConnection();

    // unsubscribe from the events
    this.dispatcher.off(DispatchEvents.TOKEN_LOGIN, "rtcConnect");
    this.dispatcher.off(DispatchEvents.TOKEN_REFRESH, "rtcConnect");
    this.dispatcher.off(DispatchEvents.UMS_LOGIN, "rtcConnect");
    this.dispatcher.off(DispatchEvents.UMS_SWITCH_USER, "rtcConnect");
    this.dispatcher.off(DispatchEvents.UMS_LOGOUT, "rtcConnect");

    return closedConnectionPromise;
  }

  /**
   * listen to system events
   *
   * @internal
   */
  private listenToEvents(): void {
    // Listing to the event when the tokenManger did login via jexiaClient().init() with the given keys
    this.dispatcher.on(DispatchEvents.TOKEN_LOGIN, "rtcConnect", async () => {
      if(!this.websocket) {
        this.tokensGivenOnInit = true;
        await this.connect();
      }
    });

    // Listing to the event when the TokenManager did a refresh
    this.dispatcher.on(DispatchEvents.TOKEN_REFRESH, "rtcConnect", async () => {
      if(this.websocket) {
        this.refreshToken();
      }
    });

    // Listing to the event when the UMS did a login
    this.dispatcher.on(DispatchEvents.UMS_LOGIN, "rtcConnect", async () => {
      this.throwUmsErrorIfNeeded();

      if(this.websocket) {
        this.refreshToken();
      }

      if(!this.websocket) {
        await this.connect();
      }
    });

    // Listing to the event when the UMS did a switch between users
    this.dispatcher.on(DispatchEvents.UMS_SWITCH_USER, "rtcConnect", async () => {
      this.throwUmsErrorIfNeeded();

      if(this.websocket) {
        this.refreshToken();
      }
    });

    // Listing to the event when the UMS did a logout
    this.dispatcher.on(DispatchEvents.UMS_LOGOUT, "rtcConnect", async () => {
      this.throwUmsErrorIfNeeded();

      await this.closeConnection();
    });
  }

  /**
   * Refresh the token by sending a Refresh command
   *
   * @internal
   */
  private refreshToken(): void {
    websocket.refreshToken(this.websocket, () => this.tokenManager.token().toPromise());
  }

  /**
   * Throw an error about using key and secret in the jexiaClient().init() while preforming UMS actions
   *
   * @internal
   */
  private throwUmsErrorIfNeeded(): void {
    if(this.tokensGivenOnInit) {
      throw new Error(MESSAGE.RTC.UMS_ERROR);
    }
  }

  /**
   * Open a new connection to the websocket
   *
   * @internal
   */
  private connect(): Promise<this> {
    const config = this.injector.get(AuthOptions) as IAuthOptions;

    // avoid 2 open connections
    // TODO add logging when not using production mode
    if (this.websocket) {
      return Promise.resolve(this);
    }

    // TODO Get rid of promises
    return this.tokenManager.token().toPromise().then((token) => {
      try {
        this.websocket = this.websocketBuilder(getRtcUrl(config, token));
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
      .then(() => websocket.start(this.websocket, () => this.tokenManager.token().toPromise()))
      .then(() => this);
  }

  private closeConnection(): Promise<this> {
    if (!this.websocket || this.websocket.readyState === WebSocketState.CLOSED) {
      return Promise.resolve(this);
    }

    // close the websocket connection
    return new Promise((resolve, reject) => {
      this.websocket.onclose = () => {
        websocket.reset();
        return resolve(this);
      };
      this.websocket.onerror = (err) => reject(err);
      this.websocket.close();
      this.websocket = undefined as unknown as IWebSocket;
    });
  }
}
