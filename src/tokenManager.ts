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
  /* store interval to be able to end refresh loop from outside */
  private refreshInterval: number;
  /* JWT and refresh tokens */
  private tokens: Promise<IAuthToken>;
  /* do not store key and secret */
  constructor(private requestAdapter: IRequestAdapter) {}

  public init(opts: IAuthOptions): Promise<TokenManager> {
    /* check if email/password were provided */
    if (!opts.key || !opts.secret) {
      return Promise.reject(new Error("Please provide valid application credentials."));
    }
    /* check application URL */
    if (!opts.appUrl) {
      return Promise.reject(new Error("Please supply a valid Jexia App URL."));
    }
    /* authenticate */
    this.tokens = this.login(opts);
    /* make sure that tokens have been successfully received */
    return this.tokens
      .then(() => {
        /* start refresh loop */
        this.refreshInterval = setInterval(() => {
          /* replace existing tokens with new ones */
          this.tokens = this.refresh(opts);
          /* exit refresh loop on failure */
          this.tokens.catch((err: Error) => this.terminate());
        }, opts.refreshInterval || delay);
      })
      .then(() => this);
  }

  public terminate() {
    clearInterval(this.refreshInterval);
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
    return this.tokens
      /* wait for tokens */
      .then((tokens: IAuthToken) => this.requestAdapter.execute(`${opts.appUrl}${authURL}`, {
          body: {refresh_token: tokens.refreshToken}, headers: {Authorization: tokens.token}, method: Methods.PATCH,
        }),
      )
      /* convert response to IAuthToken interface */
      .then((newTokens: Tokens) => ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken))
      /* catch refresh token error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }

  public get token(): Promise<string> {
    /* only actual token should be exposed (refresh_token should be hidden) */
    return this.tokens.then((tokens: IAuthToken) => tokens.token);
  }
}
