import { IAuthOptions } from "../api/core/tokenManager";

export const API = {
  AUTH: "auth",
  REFRESH: "refresh",
  DATA: {
    ENDPOINT: "ds",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/rtc",
    PORT: "",
    PROTOCOL: "wss",
  },
  UMS: {
    ENDPOINT: "ums",
    SIGNUP: "signup",
    USER: "user",
    CHANGEPASSWORD: "changepassword",
    RESETPASSWORD: "resetpassword",
  },
  CHANNEL: {
    ENDPOINT: "channel",
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;

/**
 * The default project zone
 */
export const DEFAULT_PROJECT_ZONE = "nl00";

/**
 * Suffix of API url: host.domain:port
 */
export const API_SUFFIX = `${API.HOST}.${API.DOMAIN}:${API.PORT}`;

/**
 * Gets the composed API URL of a given project
 */
export function getApiUrl({ projectID, zone }: IAuthOptions): string {
  return `${API.PROTOCOL}://${projectID}.${zone || DEFAULT_PROJECT_ZONE}.${API_SUFFIX}`;
}
