import { Injectable, InjectionToken } from "injection-js";
import { DELAY, MESSAGE } from "../../config";
import { IRequestAdapter, RequestAdapter } from "../../internal/requestAdapter";
import { APIKEY_DEFAULT_ALIAS, apiKeyAuth } from "../auth";
import { TokenStorage } from "./componentStorage";

/**
 * API interface of the authorization token
 */
export type Tokens = {
  /**
   * JSON web token
   */
  token: string,
  /**
   * Refresh token
   */
  refresh_token: string,
};

/**
 * Interface used at the client to login at the project
 */
export interface IAuthAdapter {
  /**
   * Login at the project
   */
  login(opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<Tokens>;
  /**
   * Refresh the authorization
   */
  refresh(tokenPair: Promise<IAuthToken>, requestAdapter: IRequestAdapter, projectID: string): Promise<Tokens>;
}

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
 * Internal interface of the authorization token
 */
export interface IAuthToken {
  /**
   * Alias for the token pair
   */
  auth: string;
  /**
   * Is it default token pair?
   */
  default: boolean;
  /**
   * JSON web token
   */
  readonly token: string;
  /**
   * Refresh token
   */
  readonly refreshToken: string;
}

/**
 * @internal
 */
@Injectable()
export class TokenManager {
  /* store interval to be able to end refresh loop from outside */
  private refreshInterval: number;
  /* JWT and refresh tokens */
  private tokens: Promise<IAuthToken>;


  private storage = TokenStorage.getStorageAPI();

  /* do not store key and secret */
  constructor(
    private requestAdapter: RequestAdapter,
  ) {}

  public token(auth?: string): Promise<string> {
    /* only actual token should be exposed (refresh_token should be hidden) */
    if (!this.tokens) {
      return Promise.reject(new Error(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE));
    }
    return this.tokens.then((tokens: IAuthToken) => tokens.token);
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

    let promise = Promise.resolve(this);

    /* if auth is provided */
    if (opts.key && opts.secret) {
      promise = promise.then(() => this.login(apiKeyAuth(), opts));
    }

    return promise;
  }

  public terminate(): void {
    this.storage.clear();
    clearInterval(this.refreshInterval);
    this.tokens = null as any;
  }

  private refreshToken(opts: IAuthOptions) {
    return () => {
      this.refreshInterval = setInterval(() => {
        /* replace existing tokens with new ones */
        this.tokens = this.refresh(opts.projectID);
        /* exit refresh loop on failure */
        this.tokens.catch((err: Error) => this.terminate());
      }, opts.refreshInterval || DELAY);
    };
  }

  private login(authMethod: IAuthAdapter, opts: IAuthOptions): Promise<this> {
    /* no need to wait for tokens */
    return authMethod.login(opts, this.requestAdapter)
      .then((tokens: Tokens) => {
        this.storage.setTokens(opts.auth || APIKEY_DEFAULT_ALIAS, tokens, true);
        return this;
      });
  }

  private refresh(authMethod: IAuthAdapter, projectID: string): Promise<IAuthToken> {
    return this.tokens = authMethod.refresh(this.storage.getTokens(), this.requestAdapter, projectID)
      .then((tokens) => this.storage.setTokens(tokens));
  }
}
