import { Injectable, InjectionToken } from "injection-js";
import { API, DELAY, MESSAGE } from "../../config";
import { Methods, RequestAdapter } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { TokenStorage } from "./componentStorage";

export const APIKEY_DEFAULT_ALIAS = "apikey";

/**
 * API interface of the authorization token
 */
export type Tokens = {
  /**
   * JSON web token
   */
  access_token: string,
  /**
   * Refresh token
   */
  refresh_token: string,
};

/**
 * Authorization options of the project
 */
export interface IAuthOptions {
  /**
   * Project ID
   */
  readonly projectID: string;
  /**
   * Authorization alias. Used for multiple authorization methods at the same time
   * by default used 'apikey'
   */
  auth?: string;
  /**
   * Project Key
   */
  readonly key?: string;
  /**
   * Project Password
   */
  readonly secret?: string;
  /**
   * Token refresh interval
   */
  readonly refreshInterval?: Number;
  /**
   * Remember user flag
   */
  readonly remember?: boolean;
}

export const AuthOptions = new InjectionToken<IAuthOptions>("IAuthOptions");

/**
 * @internal
 */
@Injectable()
export class TokenManager {
  /* used for auth and refresh tokens */
  private projectId: string;

  /* store interval to be able to end refresh loop from outside */
  private refreshInterval: any;

  /* initialize promise */
  private initPromise: Promise<this>;

  /* keep token promises */
  private defers: { [key: string]: Promise<any> } = {};

  private get resolved(): Promise<any[]> {
    return Promise.all([
      this.initPromise,
      ...Object.values(this.defers)
    ]);
  }

  private readonly storage = TokenStorage.getStorageAPI();

  constructor(
    private requestAdapter: RequestAdapter,
    private logger: Logger,
  ) {}

  public token(auth?: string): Promise<string> {
    return this.resolved
      .then(() => {
        const tokens = this.storage.getTokens(auth);
        if (!tokens) {
          throw new Error(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
        }
        return tokens.access_token;
      });
  }

  /**
   * Initialize Token Manager
   * should be always initialized with projectID
   * ApiKey auth is optional
   * @param opts
   */
  public init(opts: IAuthOptions): Promise<TokenManager> {
    /* check application URL */
    if (!opts.projectID) {
      return Promise.reject(new Error("Please supply a valid Jexia project ID."));
    }

    this.projectId = opts.projectID;

    this.initPromise = Promise.resolve(this);

    /* if auth is provided */
    if (opts.key && opts.secret) {
      this.initPromise = this.initPromise
        .then(() => this.login(opts));
    }

    return this.initPromise;
  }

  public terminate(): void {
    this.storage.clear();
    clearInterval(this.refreshInterval);
  }

  public setDefault(auth: string): void {
    this.storage.setDefault(auth);
  }

  public resetDefault(): void {
    this.storage.setDefault(APIKEY_DEFAULT_ALIAS);
  }

  public addTokens(auth: string, tokens: Tokens, defaults?: boolean) {
    this.storage.setTokens(auth, tokens, defaults);
    this.refreshToken(auth);
  }

  private refreshToken(auth: string) {
    this.refreshInterval = setInterval(() => {
      this.logger.debug("tokenManager", `refresh ${auth} token`);
      this.refresh(auth)
        .catch((err: Error) => {
          this.logger.error("tokenManager", err.message);
          this.terminate();
        });
    }, DELAY);
  }

  private login({auth = APIKEY_DEFAULT_ALIAS, key, secret}: IAuthOptions): Promise<this> {

    let defers: any;
    this.defers[auth] = new Promise((resolve, reject) => defers = { resolve, reject });

    return this.requestAdapter
      .execute(this.authUrl, {
        body: {
          method: "apk",
          key,
          secret,
        },
        method: Methods.POST,
      })
      .then((tokens: Tokens) => {
        this.addTokens(auth, tokens, true);
        defers.resolve(tokens.access_token);
        return this;
      })
      .catch((err: Error) => {
        defers.reject(err);
        this.logger.error("tokenManager", err.message);
        throw new Error(`Unable to authenticate: ${err.message}`);
      });
  }

  private refresh(auth: string): Promise<any> {
    const tokens = this.storage.getTokens(auth);

    if (!tokens || !tokens.refresh_token) {
      return Promise.reject(new Error(`There is no refresh token for ${auth}`));
    }

    let defers: any;
    this.defers[auth] = new Promise((resolve, reject) => defers = { resolve, reject });

    return this.requestAdapter
      .execute(this.refreshUrl, {
        body: { refresh_token: tokens.refresh_token },
        method: Methods.POST
      })
      .then((refreshedTokens: Tokens) => {
        this.storage.setTokens(auth, refreshedTokens);
        defers.resolve(tokens.access_token);
        return this;
      })
      .catch((err: Error) => {
        defers.reject(err);
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }

  private get url(): string {
    return `${API.PROTOCOL}://${this.projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}`;
  }

  private get authUrl(): string {
    return `${this.url}/${API.AUTH}`;
  }

  private get refreshUrl(): string {
    return `${this.url}/${API.REFRESH}`;
  }
}
