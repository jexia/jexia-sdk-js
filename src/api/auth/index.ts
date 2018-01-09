import { ApiKeyAuth } from "./apiKeyAuth";
import { UserCredentialsAuth } from "./userCredentialsAuth";

export function userCredentialsAuth() {
  return new UserCredentialsAuth();
}

export function apiKeyAuth() {
  return new ApiKeyAuth();
}
