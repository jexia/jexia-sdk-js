import { API, DELAY } from "../../config/config";
import { MESSAGE } from "../../config/message";
import { IRequestAdapter, Methods } from "../../internal/requestAdapter";
import { IStorageComponent, TokenStorage } from "./componentStorage";

type Tokens = {token: string, refresh_token: string};

export interface IAuthOptions {
  /* application URL */
  readonly appUrl: string;
  /* email */
  readonly key: string;
  /* password */
  readonly secret: string;
  /* token refresh interval (optional) */
  readonly refreshInterval?: Number;
  /* remember user (optional) */
  readonly remember?: boolean;
}

export interface IAuthToken {
  /* JSON web token */
  readonly token: string;
  /* refresh token */
  readonly refreshToken: string;
}

export class TokenManager {
  /* store interval to be able to end refresh loop from outside */
  private refreshInterval: number;
  /* JWT and refresh tokens */
  private tokens: Promise<IAuthToken>;

  private storage: IStorageComponent;

  private requestAdapter: IRequestAdapter;
  /* do not store key and secret */
  constructor(requestAdapter: IRequestAdapter) {
    this.requestAdapter = requestAdapter;
    this.storage = TokenStorage.getStorageAPI();
  }

  private refreshToken(opts: IAuthOptions) {
    return () => {
      this.refreshInterval = setInterval(() => {
        /* replace existing tokens with new ones */
        this.tokens = this.refresh(opts.appUrl);
        /* exit refresh loop on failure */
        this.tokens.catch((err: Error) => this.terminate());
      }, opts.refreshInterval || DELAY);
    };
  }

  public init(opts: IAuthOptions): Promise<TokenManager> {
    /* check if email/password were provided */
    if (!opts.key || !opts.secret) {
      return Promise.reject(new Error("Please provide valid application credentials."));
    }
    /* check application URL */
    if (!opts.appUrl) {
      return Promise.reject(new Error("Please supply a valid Jexia App URL."));
    }

    this.tokens = this.storage.isEmpty() === true ? this.login(opts) : this.storage.getTokens();

    /* make sure that tokens have been successfully received */
    return this.tokens
      .then(this.refreshToken(opts))
      .then(() => this);
  }

  public terminate(): void {
    clearInterval(this.refreshInterval);
    delete this.tokens;
  }

  private login(opts: IAuthOptions): Promise<IAuthToken> {
    /* no need to wait for tokens */
    return this.requestAdapter
      .execute(this.buildLoginUrl(opts.appUrl), {body: {email: opts.key, password: opts.secret}, method: Methods.POST})
      .then((newTokens: Tokens) => {
        return ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken);
      })
      .then((tokens) => this.storage.setTokens(tokens))
      /* convert response to IAuthToken interface */
      
      /* catch login error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to authenticate: ${err.message}`);
      });
  }

  private buildLoginUrl(appUrl: string): string {
    return `${API.PROTOCOL}://${appUrl}:${API.PORT}/${API.AUTHURL}`;
  }

  private refresh(appUrl: string): Promise<IAuthToken> {
    /* wait for tokens */
    return this.tokens
      /* wait for tokens */
      .then((tokens: IAuthToken) => this.requestAdapter.execute(this.buildLoginUrl(appUrl), {
          body: {refresh_token: tokens.refreshToken}, headers: {Authorization: tokens.token}, method: Methods.PATCH,
        }),
      )
      /* convert response to IAuthToken interface */
      .then((newTokens: Tokens) => ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken))
      .then((tokens) => this.storage.setTokens(tokens))
      
      /* catch refresh token error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }

  public get token(): Promise<string> {
    /* only actual token should be exposed (refresh_token should be hidden) */
    if (!this.tokens) {
      return Promise.reject(new Error(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE));
    }
    return this.tokens.then((tokens: IAuthToken) => tokens.token);
  }
}
