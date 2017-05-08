import * as Promise from "bluebird";
import {IHTTPResponse} from "./queryRequestAdapter";

export interface IAuthOptions {
  readonly appUrl: string;
  readonly key: string;
  readonly secret: string;
}

interface IAuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface IAuthToken {
  readonly token: string;
  readonly refreshToken: string;
}

export interface IAuthorizationHeader {
  readonly authorization: string;
}

export function getAuthenticationRequestPromise(fetch: Function, authOptions: IAuthOptions): Promise<IAuthToken> {
  const credentials: IAuthCredentials = { email: authOptions.key, password: authOptions.secret};
  return makeAuthenticationRequest(fetch, authOptions.appUrl, credentials);
}

function makeAuthenticationRequest(fetch: Function, url: string, credentials: IAuthCredentials): Promise<IAuthToken> {
  if (!credentials.email || !credentials.password) {
    return new Promise<IAuthToken>( (resolve, reject) => {
      reject(new Error("Plase provide valid application credentials."));
    });
  }

  if (!url) {
     return new Promise<IAuthToken>( (resolve, reject) => {
      reject(new Error("Please supply a valid Jexia App URL."));
    });
  }

  return fetch(`${url}/auth`, {method: "POST", body: JSON.stringify(credentials)}).then( (res: IHTTPResponse) => {
    if (!res.ok) {
      // the fetch request went through but we received an error from the server
      return res.json().then( (body) => {
        throw new Error(body.errors[0]);
      });
    }

    return res.json();
  }).then( (tokens) => {
    return new Promise<IAuthToken>( (resolve, reject) => {
      resolve({ token: tokens.token, refreshToken: tokens.refresh_token });
    });
  });
}
