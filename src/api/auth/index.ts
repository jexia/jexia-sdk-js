import { IAuthAdapter } from "../core/tokenManager";
import { ApiKeyAuth } from "./apiKeyAuth";

/**
 * Generates an authorization adapter using api key
 * @returns The generated adapter
 */
export function apiKeyAuth(): IAuthAdapter {
  return new ApiKeyAuth();
}
