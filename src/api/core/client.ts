import { InjectionToken, ReflectiveInjector } from "injection-js";
import { Fetch, RequestAdapter } from "../../internal/requestAdapter";
import { deferPromise } from "../../internal/utils";
import { IModule } from "./module";
import { AuthOptions, IAuthOptions, TokenManager } from "./tokenManager";

export const ClientInit = new InjectionToken<Promise<Client>>("SystemInit");

export class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  public tokenManager: TokenManager;
  /* modules to be initilized */
  private modules: IModule[];

  public constructor(
    private fetch: Fetch,
  ) {}

  public init(opts: IAuthOptions, ...modules: IModule[]): Promise<Client> {
    const systemDefer = deferPromise<Client>();
    const injector = ReflectiveInjector.resolveAndCreate([
      {
        provide: ClientInit,
        useValue: systemDefer.promise,
      },
      {
        provide: AuthOptions,
        useValue: opts,
      },
      {
        provide: RequestAdapter,
        useFactory: () => new RequestAdapter(this.fetch),
      },
      TokenManager,
    ]);
    this.tokenManager = injector.get(TokenManager);

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

  public terminate(): Promise<Client> {
    /* terminates the token manager */
    this.tokenManager.terminate();
    /* creates an array of promises to store the resulting promises when calling the terminate method of each module */
    const promises = this.modules.map((m) => m.terminate());

    return Promise.all(promises)
      /* Make the client still available (not initialized) after terminated */
      .then(() => this);
  }

}

export function authenticate(projectID: string, key: string, secret: string): IAuthOptions {
  return {projectID, key, secret};
}
