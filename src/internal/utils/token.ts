import jwt_decode from "jwt-decode";

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
