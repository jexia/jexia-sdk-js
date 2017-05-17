import * as Promise from "bluebird";
import { IRequestAdapter, Methods } from "./requestAdapter";
/* AUTH module URL */
const authURL = "/auth";
/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
const delay = 1000 * 60 * 110;

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
}

export interface IAuthToken {
  /* JSON web token */
  readonly token: string;
  /* refresh token */
  readonly refreshToken: string;
}

export class TokenManager {
  /* authentication state */
  private authenticated: Boolean = false;
  /* JWT and refresh tokens */
  private tokens: IAuthToken;
  /* do not store key and secret */
  constructor(private requestAdapter: IRequestAdapter) {}

  public init(opts: IAuthOptions): Promise<TokenManager> {
    /* reset flag (in case of reinitialization) */
    this.authenticated = false;
    /* check if email/password were provided */
    if (!opts.key || !opts.secret) {
      return Promise.reject(new Error("Please provide valid application credentials."));
    }
    /* check application URL */
    if (!opts.appUrl) {
      return Promise.reject(new Error("Please supply a valid Jexia App URL."));
    }
    /* authenticate */
    return this.login(opts)
      .then((tokens: IAuthToken) => {
        /* change state */
        this.authenticated = true;
        /* save tokens */
        this.tokens = tokens;
        /* run auto refresh loop */
        let refreshInterval = setInterval(() => {
          this.refresh(opts)
            .then((newTokens: IAuthToken) => {
              /* update authentication status */
              this.authenticated = true;
              /* replace existing tokens with new ones */
              this.tokens = newTokens;
            })
            .catch((err: Error) => {
              /* failed */
              this.authenticated = false;
              /* exit refresh loop */
              clearInterval(refreshInterval);
            });
        }, opts.refreshInterval || delay);
        /* return Promise of TokenManager */
        return this;
      });
  }

  private login(opts: IAuthOptions): Promise<IAuthToken> {
    /* no need to wait for tokens */
    return this.requestAdapter
      .execute(`${opts.appUrl}${authURL}`, {body: {email: opts.key, password: opts.secret}, method: Methods.POST})
      /* convert response to IAuthToken interface */
      .then((tokens: Tokens) => ({token: tokens.token, refreshToken: tokens.refresh_token} as IAuthToken))
      /* catch login error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to authenticate: ${err.message}`);
      });
  }

  private refresh(opts: IAuthOptions): Promise<IAuthToken> {
    /* wait for tokens */
    return this.requestAdapter.execute(`${opts.appUrl}${authURL}`, {
        body: {refresh_token: this.refreshToken}, headers: {Authorization: this.token}, method: Methods.PATCH,
      })
      /* convert response to IAuthToken interface */
      .then((newTokens: Tokens) => ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken))
      /* catch refresh token error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }

  public get token(): string {
    if (!this.authenticated) {
      throw new Error("TokenManager does not contain a valid token.");
    }
    return this.tokens.token;
  }

  private get refreshToken(): string {
    if (!this.authenticated) {
      throw new Error("TokenManager does not contain a valid token.");
    }
    return this.tokens.refreshToken;
  }
}
