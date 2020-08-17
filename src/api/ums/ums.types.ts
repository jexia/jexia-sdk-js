import { DefaultResourceInterface } from "../core/resource";

export interface IUMSCredentials {
  email: string;
  password: string;
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
export type IUMSSignInOptions = IUMSCredentials & Partial<IUMSSignInAdditionalOptions>;

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
