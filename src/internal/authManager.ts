import { IAuthOptions, IAuthToken, Tokens } from "../api/core/tokenManager";
import { API } from "../config/config";
import { IRequestAdapter, Methods } from "./requestAdapter";

interface ILoginFunction {
  (opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<IAuthToken>;
}

export function getLoginMethod(opts: IAuthOptions): ILoginFunction {
  return loginUserCredentials;
}

function loginUserCredentials(opts: IAuthOptions, requestAdapter: IRequestAdapter): Promise<IAuthToken> {
  return requestAdapter
    .execute(buildLoginUrl(opts.projectID), {
      body: {
        email: opts.key,
        password: opts.secret,
      },
      method: Methods.POST,
    })
    .then((newTokens: Tokens) => {
      return ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken);
    })
    /* catch login error */
    .catch((err: Error) => {
      /* add specific information to error */
      throw new Error(`Unable to authenticate: ${err.message}`);
    });
}

export function refreshToken(tokenPair: Promise<IAuthToken>,
                             requestAdapter: IRequestAdapter,
                             projectID: string): Promise<any> {
  /* wait for tokens */
  return tokenPair.then((tokens: IAuthToken) => requestAdapter.execute(buildLoginUrl(projectID), {
        body: {refresh_token: tokens.refreshToken},
        headers: {Authorization: tokens.token},
        method: Methods.PATCH,
      }))
    /* convert response to IAuthToken interface */
    .then((newTokens: Tokens) => ({token: newTokens.token, refreshToken: newTokens.refresh_token} as IAuthToken))
    /* catch refresh token error */
    .catch((err: Error) => {
      /* add specific information to error */
      throw new Error(`Unable to refresh token: ${err.message}`);
    });
}

function buildLoginUrl(projectID: string): string {
  return `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTHURL}`;
}
