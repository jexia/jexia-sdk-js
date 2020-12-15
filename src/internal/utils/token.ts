import jwt_decode from "jwt-decode";

/**
 * Calculate the expiration time until a token expired
 * @internal
 */
export function untilTokenExpired(accessToken: string): number {
  try {
    const { exp: expired } = jwt_decode<{ exp: number }>(accessToken);
    const now = Date.now() / 1000;

    // if expired, return 0 so it can call the refresh directly
    if(expired < now ) {
      return 0;
    }

    // calculate the diff
    const diff = expired - now;

    // return the ms
    return diff * 1000;
  } catch (e) {
    return 0;
  }
}

/**
 * Calculate the delay when refreshing a token via a timer
 * @internal
 */
export function delayTokenRefresh(accessToken: string): number {
  const tokenExpired = untilTokenExpired(accessToken);
  const threshold = 60 * 10000; // 10m in ms

  // if the token is less then the threshold, divide it
  // otherwise just subtract the threshold to get in the safe zone
  return tokenExpired < threshold
    ? tokenExpired / 2
    : tokenExpired - threshold;
}

/**
 * Check if a token is expired or not
 * @internal
 */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp: expired } = jwt_decode<{ exp: number }>(token);
    const now = Date.now() / 1000; // exp is represented in seconds since epoch
    return now > expired;
  } catch (e) {
    return true;
  }
}
