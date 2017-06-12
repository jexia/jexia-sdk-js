import { IRequestAdapter, RequestAdapter } from "./requestAdapter";
import { IAuthOptions, TokenManager } from "./tokenManager";

export default class Client {
  /* token manager (responsible for getting fresh and valid token), should be injected to plugins/modules (if needed) */
  public tokenManager: TokenManager;
  /* request adapter */
  public requestAdapter: IRequestAdapter = new RequestAdapter(fetch);
  /* application URL */
  private appUrl: string;

  public init(opts: IAuthOptions): Promise<Client> {
    /* save only appUrl (do not store key and secret) */
    this.appUrl = opts.appUrl;
    /* init TokenManager to have token auto refresh */
    this.tokenManager = new TokenManager(this.requestAdapter);
    /* return Promise */
    return this.tokenManager.init(opts).then(() => this);
  }
}
