import { API } from "../../config/config";
import { IRequestAdapter, Methods } from "../../internal/requestAdapter";
import { IAuthAdapter, IAuthOptions, IAuthToken, Tokens } from "../core/tokenManager";

/**
 * @internal
 */
export abstract class BaseAuth implements IAuthAdapter {

  protected abstract authUrl: string;

  public login(opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<IAuthToken> {
    return requestAdapter
      .execute(this.buildLoginUrl(opts.projectID), {
        body: this.getLoginRequestBody(opts),
        method: Methods.POST,
      })
      /* convert response to IAuthToken interface */
      .then(({ token, refresh_token }: Tokens) => ({ token, refreshToken: refresh_token }))
      /* catch login error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to authenticate: ${err.message}`);
      });
  }

  public refresh(
    tokenPair: Promise<IAuthToken>,
    requestAdapter: IRequestAdapter,
    projectID: string,
  ): Promise<IAuthToken> {
    /* wait for tokens */
    return tokenPair.then((tokens: IAuthToken) => requestAdapter.execute(
      this.buildLoginUrl(projectID), {
        body: { refresh_token: tokens.refreshToken },
        headers: { Authorization: tokens.token },
        method: Methods.PATCH,
      }))
      /* convert response to IAuthToken interface */
      .then(({ token, refresh_token }: Tokens) => ({ token, refreshToken: refresh_token }))
      /* catch refresh token error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }
  protected abstract getLoginRequestBody(opts: IAuthOptions): any;

  private buildLoginUrl(projectID: string): string {
    return `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${this.authUrl}`;
  }

}
