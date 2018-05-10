import { IAuthAdapter } from "../core/tokenManager";
import { ApiKeyAuth } from "./apiKeyAuth";

export function apiKeyAuth() {
export function apiKeyAuth(): IAuthAdapter {
  return new ApiKeyAuth();
}
