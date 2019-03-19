import { IAuthAdapter } from "../core/tokenManager";
import { ApiKeyAuth } from "./apiKeyAuth";

/**
 * Default alias name for the apikey auth
 */
export const APIKEY_DEFAULT_ALIAS = 'apikey';

/**
 * Generates an authorization adapter using api key
 * @returns The generated adapter
 */
export function apiKeyAuth(): IAuthAdapter {
  return new ApiKeyAuth();
}
