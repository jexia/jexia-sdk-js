import { getAuthenticationRequestPromise, IAuthOptions, IAuthorizationHeader, IAuthToken } from "./auth";

export class TokenManager {
  private tokens: IAuthToken;
  private appUrl: string;
  private fetch: Function;
  private authenticated: Boolean;

  constructor(url: string, fetch: Function) {
    this.appUrl = url;
    this.fetch = fetch;
    this.initTokens();
  }

  public authenticate(key: string, secret: string): Promise<TokenManager> {
    this.initTokens();
    let authOptions: IAuthOptions = {appUrl: this.appUrl, key, secret};
    return getAuthenticationRequestPromise( this.fetch, authOptions).then( (tokens) => {
      this.tokens = tokens;
      this.authenticated = true;
      return this;
    });
  }

  public get Token(): string {
    if (!this.authenticated) {
      throw new Error("TokenManager does not contain a valid token. Forgot to authenticate?");
    }
    return this.tokens.token;
  }

  public getAuthorizationHeader(): IAuthorizationHeader {
    return { authorization: this.Token };
  }

  private initTokens(): void {
    this.authenticated = false;
    this.tokens = {token: "", refreshToken: ""};
  }
}
