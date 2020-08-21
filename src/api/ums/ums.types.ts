import { DefaultResourceInterface } from "../core/resource";

export interface IUMSCredentials {
  email: string;
  password: string;
}

/**
 * Defines sign-in parameters for oauth authentication
 */
export interface IUMSSignInOAuth {
  /**
   * The "code" query parameter from oauth's response
   */
  code: string;
  /**
   * The "state" query parameter from oauth's response
   */
  state: string;
}

/**
 * The type of the oauth operation
 */
export type OAuthActionType = "sign-in" | "sign-up";

/**
 * Defines sign-in parameters for initialize oauth authentication
 */
export interface IUMOAuthInitOptions {
  /**
   * The type of the action being executed.
   */
  action: OAuthActionType;
  /**
   * The name of the oauth provider (e.g. "facebook", "google")
   */
  provider: string;
  /**
   * The URI that the oauth authorize operation will redirect to.
   */
  redirect?: string;
}

/**
 * Defines extra fields for sign-up
 */
export type IUMSExtraFields = Omit<{ [key: string]: any }, "email" | "password">;

export type IUMSSignUpFields = IUMSCredentials & IUMSExtraFields;

export interface IUMSSignInAdditionalOptions {
  default: boolean;
  alias: string;
}

/**
 * Defines sign-in options for non-oauth authentication
 */
export type IUMSSignInOptions = (IUMSCredentials | IUMSSignInOAuth) & Partial<IUMSSignInAdditionalOptions>;

/**
 * Default UMS interface type
 */
export type DefaultUsersInterface = {
  email: string;
  active: boolean;
};

/**
 * Merge customer's type with resource and UMS types
 */
export type UsersInterface<T> = T & DefaultResourceInterface & DefaultUsersInterface;
