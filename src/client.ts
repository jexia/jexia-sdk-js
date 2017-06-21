import { IModule } from "./module";
import { QueryExecuterFactory } from "./queryExecuterFactory";
import { IRequestAdapter, RequestAdapter } from "./requestAdapter";
import { IAuthOptions, TokenManager } from "./tokenManager";

export default class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  public tokenManager: TokenManager;
  /* request adapter */
  public requestAdapter: IRequestAdapter = new RequestAdapter(fetch);
  /* application URL */
  private appUrl: string;
  private queryExecuter: QueryExecuterFactory;

  public init(opts: IAuthOptions, ...modules: IModule[]): Promise<Client> {
    /* save only appUrl (do not store key and secret) */
    this.appUrl = opts.appUrl;

    this.tokenManager = new TokenManager(this.requestAdapter);

    this.queryExecuter = new QueryExecuterFactory(this.appUrl, this.requestAdapter, this.tokenManager);

    return this.tokenManager.init(opts)
      /* init all modules */
      .then(() => Promise.all(modules.map((curr) => curr.init(this.tokenManager, this.requestAdapter))))
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
