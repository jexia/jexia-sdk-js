import { IModule } from "./module";
import { IRequestAdapter, RequestAdapter } from "./requestAdapter";
import { IAuthOptions, TokenManager } from "./tokenManager";

export default class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  public tokenManager: TokenManager;
  /* request adapter */
  public requestAdapter: IRequestAdapter;
  /* application URL */
  private appUrl: string;

  public constructor(private fetch: Function) {
    this.requestAdapter = new RequestAdapter(this.fetch);
    this.tokenManager = new TokenManager(this.requestAdapter);
  }

  public init(opts: IAuthOptions, ...modules: IModule[]): Promise<Client> {
    /* save only appUrl (do not store key and secret) */
    this.appUrl = opts.appUrl;

    return this.tokenManager.init(opts)
      /* init all modules */
      .then(() => Promise.all(modules.map((curr) => curr.init(this.appUrl, this.tokenManager, this.requestAdapter))))
      /* make the Client available only after all modules have been successfully initialized */
      .then(() => this)
      /* if token manager failed to init or at least one of core modules failed to load */
      .catch((err: Error) => {
        /* stop refresh loop */
        this.tokenManager.terminate();
        /* throw error up (to global catch)*/
        throw err;
      });
  }
}

export function authenticate(appUrl: string, key: string, secret: string): IAuthOptions {
  return {appUrl, key, secret};
}
