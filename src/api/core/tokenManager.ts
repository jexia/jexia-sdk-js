import { Injectable, InjectionToken } from "injection-js";
import { DELAY } from "../../config/config";
import { MESSAGE } from "../../config/message";
import { IRequestAdapter, RequestAdapter } from "../../internal/requestAdapter";
import { apiKeyAuth } from "../auth";
import { TokenStorage } from "./componentStorage";

export type Tokens = { token: string, refresh_token: string };

export interface IAuthAdapter {
  login(opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<IAuthToken>;
  refresh(tokenPair: Promise<IAuthToken>, requestAdapter: IRequestAdapter, projectID: string): Promise<IAuthToken>;
}

export interface IAuthOptions {
  /* application URL */
  readonly projectID: string;
  /* email */
  readonly key: string;
  /* password */
  readonly secret: string;
  /* token refresh interval (optional) */
  readonly refreshInterval?: Number;
  /* remember user (optional) */
  readonly remember?: boolean;
  /* auth method */
  readonly authMethod?: () => IAuthAdapter;
}

export const AuthOptions = new InjectionToken<IAuthOptions>("IAuthOptions");

export interface IAuthToken {
  /* JSON web token */
  readonly token: string;
  /* refresh token */
  readonly refreshToken: string;
}

@Injectable()
export class TokenManager {
  /* store interval to be able to end refresh loop from outside */
  private refreshInterval: number;
  /* JWT and refresh tokens */
  private tokens: Promise<IAuthToken>;

  private authMethod: IAuthAdapter;

  private storage = TokenStorage.getStorageAPI();
  /* do not store key and secret */
  constructor(
    private requestAdapter: RequestAdapter,
  ) {}

  public get token(): Promise<string> {
    /* only actual token should be exposed (refresh_token should be hidden) */
    if (!this.tokens) {
      return Promise.reject(new Error(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE));
    }
    return this.tokens.then((tokens: IAuthToken) => tokens.token);
  }

  public init(opts: IAuthOptions): Promise<TokenManager> {
    this.authMethod = opts.authMethod ? opts.authMethod() : apiKeyAuth();
    /* check if email/password were provided */
    if (!opts.key || !opts.secret) {
      return Promise.reject(new Error("Please provide valid application credentials."));
    }
    /* check application URL */
    if (!opts.projectID) {
      return Promise.reject(new Error("Please supply a valid Jexia project ID."));
    }

    this.tokens = this.storage.isEmpty() ? this.login(opts) : this.storage.getTokens();

    /* make sure that tokens have been successfully received */
    return this.tokens
      .then(this.refreshToken(opts))
      .then(() => this);
  }

  public terminate(): void {
    this.storage.clear();
    clearInterval(this.refreshInterval);
    delete this.tokens;
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

  private login(opts: IAuthOptions): Promise<IAuthToken> {
    /* no need to wait for tokens */
    return this.authMethod.login(opts, this.requestAdapter).
      then((tokens: IAuthToken) => this.storage.setTokens(tokens));
  }

  private refresh(projectID: string): Promise<IAuthToken> {
    return this.authMethod.refresh(this.tokens, this.requestAdapter, projectID).
      then((tokens) => this.storage.setTokens(tokens));
  }
}
