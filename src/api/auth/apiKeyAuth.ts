import { API } from "../../config/config";
import { IRequestAdapter, Methods } from "../../internal/requestAdapter";
import { IAuthAdapter, IAuthOptions, IAuthToken, Tokens } from "../core/tokenManager";

export class ApiKeyAuth implements IAuthAdapter {

  public login(opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<IAuthToken> {
    return requestAdapter
      .execute(buildLoginUrl(opts.projectID), {
        body: {
          key: opts.key,
          secret: opts.secret,
        },
        method: Methods.POST,
      })
      .then((newTokens: Tokens) => {
        return ({ token: newTokens.token, refreshToken: newTokens.refresh_token } as IAuthToken);
      })
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
    return tokenPair.then((tokens: IAuthToken) => requestAdapter.execute(buildLoginUrl(projectID), {
      body: { refresh_token: tokens.refreshToken },
      headers: { Authorization: tokens.token },
      method: Methods.PATCH,
    }))
      /* convert response to IAuthToken interface */
      .then((newTokens: Tokens) => ({ token: newTokens.token, refreshToken: newTokens.refresh_token } as IAuthToken))
      /* catch refresh token error */
      .catch((err: Error) => {
        /* add specific information to error */
        throw new Error(`Unable to refresh token: ${err.message}`);
      });
  }
}

function buildLoginUrl(projectID: string): string {
  return `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.API_KEY}`;
}
