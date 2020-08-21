import { IUMSSignInOptions, IUMSSignInOAuth } from "./ums.types";
import { API } from "../../config/config";

/**
 * Whether the sign in parameters are for oauth
 */
function isOAuth(options: IUMSSignInOptions): options is IUMSSignInOAuth {
  return (options as any).code !== undefined && (options as any).state !== undefined;
}

/**
 * Gets the body of a sign-in request based on its type
 */
export function getSignInBody(options: IUMSSignInOptions) {
  return isOAuth(options)
    ? {
      method: "oauth",
      code: options.code,
      state: options.state,
    }
    : {
      method: "ums",
      email: options.email,
      password: options.password,
    };
}

/**
 * Gets the body of a sign-in request based on the options type
 */
export function getSignInParams(options: IUMSSignInOptions) {
  const aliases = [isOAuth(options) ? "oauth" : options.email];
  const endpoint = isOAuth(options) ? API.OAUTH.AUTH : API.AUTH;

  if (options.alias) {
    aliases.push(options.alias);
  }

  return {
    body: getSignInBody(options),
    endpoint,
    aliases,
  };
}
