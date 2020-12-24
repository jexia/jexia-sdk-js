import { InjectionToken, ReflectiveInjector } from "injection-js";
import { Fetch, RequestAdapter } from "../../internal/requestAdapter";
import { deferPromise } from "../../internal/utils";
import { Logger } from "../logger/logger";
import { IModule, ModuleConfiguration } from "./module";
import { AuthOptions, IAuthOptions, TokenManager } from "./tokenManager";
import { Dispatcher } from "./dispatcher";

/**
 * @internal
 */
export const ClientInit = new InjectionToken<Promise<Client>>("SystemInit");

/**
 * @internal
 */
export const ClientConfiguration = new InjectionToken("ClientConfiguration");

export function CollectConfigurationFactory(modules: IModule[]) {
  // tslint:disable-next-line:only-arrow-functions
  return function() {
    return Client.collectConfiguration(modules);
  };
}

export function RequestAdapterFactory(fetch: Fetch) {
  // tslint:disable-next-line:only-arrow-functions
  return function() {
    return new RequestAdapter(fetch);
  };
}

/**
 * Jexia main client fo the JavaScript SDK, used to initialize the necessary modules with your project information.
 * This object must be build from the helper functions, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * import { jexiaClient } from "jexia-sdk-js/node";
 *
 * jexiaClient().init(credentials, arrayOfJexiaModules);
 * ```
 */
export class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  private tokenManager: TokenManager;
  /* modules to be initialized */
  private modules: IModule[];

  /**
   * @internal
   */
  public constructor(
    private fetch: Fetch,
  ) {}

  /**
   * Initialized the Jexia client with all the used modules
   * @param opts Your project data
   * @param modules Jexia modules that will be used
   * @returns A promise that just finishes when all the given modules finished their initialization
   */
  public init(opts: IAuthOptions, ...modules: IModule[]): Promise<Client> {
    const systemDefer = deferPromise<Client>();
    const injector = ReflectiveInjector.resolveAndCreate([
      {
        provide: ClientInit,
        useValue: systemDefer.promise,
      },
      {
        provide: ClientConfiguration,
        useFactory: CollectConfigurationFactory(modules),
      },
      {
        provide: AuthOptions,
        useValue: opts,
      },
      {
        provide: RequestAdapter,
        useFactory: RequestAdapterFactory(this.fetch),
      },
      Logger,
      TokenManager,
      Dispatcher,
    ]);
    this.tokenManager = injector.get(TokenManager);

    /* provide logger for the request adapter */
    injector.get(RequestAdapter).provideLogger(injector.get(Logger));

    /* save only projectID (do not store key and secret) */
    this.modules = modules;

    const parallel: Array<Promise<any>> = [
      this.tokenManager.init(opts),
      /* init all modules */
      ...modules.map((m) => m.init(injector)),
    ];

    Promise.all(parallel)
      /* make the Client available only after all modules have been successfully initialized */
      .then(() => this)
      /* if token manager failed to init or at least one of core modules failed to load */
      .catch((err: Error) => {
        /* stop refresh loop */
        this.tokenManager.terminate();
        /* throw error up (to global catch)*/
        throw err;
      })
      .then(systemDefer.resolve, systemDefer.reject);

    return systemDefer.promise;
  }

  /**
   * Terminate the Jexia client with all the used modules
   * @returns A promise that just finishes when all the given modules finished their termination
   */
  public terminate(): Promise<Client> {
    /* terminates the token manager */
    this.tokenManager.terminate();
    /* creates an array of promises to store the resulting promises when calling the terminate method of each module */
    const promises = this.modules.map((m) => m.terminate());

    return Promise.all(promises)
      /* Make the client still available (not initialized) after terminated */
      .then(() => this);
  }

  /**
   * Collect all module configurations into one configuration object
   * @param modules
   */
  static collectConfiguration(modules: IModule[]): { [moduleName: string]: ModuleConfiguration } {
    return Object.assign({}, ...modules.map((module) => module.getConfig()));
  }

}
