import { Injectable, InjectionToken } from "injection-js";
import { API, DELAY, MESSAGE } from "../../config";
import { Methods, RequestAdapter } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { TokenStorage } from "./componentStorage";

const APIKEY_DEFAULT_ALIAS = "apikey";

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
 * Keep token pairs and refresh them when its needed
 */
@Injectable()
export class TokenManager {
  /* used for auth and refresh tokens */
  private projectId: string;

  /* store intervals to be able to end refresh loop from outside */
  private refreshes: any[] = [];

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

  private storage = TokenStorage.getStorageAPI();

  constructor(
    private requestAdapter: RequestAdapter,
    private logger: Logger,
  ) {}

  /**
   * Get access token for the specific authentication alias (APK by default)
   * @param {string} auth Authentication alias
   */
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
   * @param {IAuthOptions} opts Initialize options
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

  /** Terminate token manager and clear all tokens
   */
  public terminate(): void {
    this.storage.clear();
    this.refreshes.forEach((interval) => clearInterval(interval));
    this.refreshes = [];
  }

  /**
   * Set specific token to use by default
   * @param {string} auth authentication alias
   */
  public setDefault(auth: string): void {
    this.storage.setDefault(auth);
  }

  /**
   * Switch back to apikey token
   */
  public resetDefault(): void {
    this.storage.setDefault(APIKEY_DEFAULT_ALIAS);
  }

  /**
   * Add new token pair and run refresh digest
   * @param {string} auth Authenticate alias
   * @param {Tokens} tokens Token pair
   * @param {boolean} defaults Whether to use this token by default
   */
  public addTokens(auth: string, tokens: Tokens, defaults?: boolean) {
    this.storage.setTokens(auth, tokens, defaults);
    this.startRefreshDigest(auth);
  }

  /**
   * Start refreshing digest for the specific auth
   * @ignore
   */
  private startRefreshDigest(auth: string) {
    this.refreshes.push(
      setInterval(() => {
        this.logger.debug("tokenManager", `refresh ${auth} token`);
        this.refresh(auth)
          .catch(() => this.terminate());
      }, DELAY)
    );
  }

  /**
   * Login to the project using APK method
   * @ignore
   */
  private login({auth = APIKEY_DEFAULT_ALIAS, key, secret}: IAuthOptions): Promise<this> {
    return this.obtainTokens(auth, this.authUrl, { method: "apk", key, secret })
      .then((tokens) => {
        this.addTokens(auth, tokens, true);
        return this;
      });
  }

  /**
   * Refresh the token
   * @ignore
   */
  private refresh(auth: string): Promise<this> {

    const tokens = this.storage.getTokens(auth);

    if (!tokens || !tokens.refresh_token) {
      return Promise.reject(new Error(`There is no refresh token for ${auth}`));
    }

    return this.obtainTokens(auth, this.refreshUrl, { refresh_token: tokens.refresh_token })
      .then((refreshedTokens) => {
        this.storage.setTokens(auth, refreshedTokens);
        return this;
      });
  }

  /**
   * Get tokens from the project
   * @ignore
   */
  private obtainTokens(auth: string, url: string, body: object): Promise<Tokens> {

    let defers: any;
    this.defers[auth] = new Promise((resolve, reject) => defers = { resolve, reject });

    return this.requestAdapter
      .execute(url, {
        body,
        method: Methods.POST
      })
      .then((refreshedTokens: Tokens) => {
        defers.resolve(refreshedTokens.access_token);
        return refreshedTokens;
      })
      .catch((err: Error) => {
        defers.reject(err);
        this.logger.error("tokenManager", err.message);
        throw new Error(`Unable to get tokens: ${err.message}`);
      });
  }

  /**
   * Project url
   * @ignore
   */
  private get url(): string {
    return `${API.PROTOCOL}://${this.projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}`;
  }

  /**
   * Authenticate url
   * @ignore
   */
  private get authUrl(): string {
    return `${this.url}/${API.AUTH}`;
  }

  /**
   * Refresh token url
   * @ignore
   */
  private get refreshUrl(): string {
    return `${this.url}/${API.REFRESH}`;
  }
}
