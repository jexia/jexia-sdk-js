import { IAuthOptions } from "../api/core/tokenManager";

export const API = {
  AUTH: "auth",
  REFRESH: "auth/refresh",
  DATA: {
    ENDPOINT: "ds",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/rtc",
    PROTOCOL: "wss://",
  },
  UMS: {
    ENDPOINT: "ums",
    SIGNUP: "signup",
    USER: "user",
    CHANGEPASSWORD: "changepassword",
    RESETPASSWORD: "resetpassword",
  },
  OAUTH: {
    INIT: "oauth/init",
    AUTH: "oauth/auth",
  },
  CHANNEL: {
    ENDPOINT: "channel",
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https://",
};

/**
 * The default project zone
 */
export const DEFAULT_PROJECT_ZONE = "nl00";

/**
 * Suffix of API url: host.domain:port
 */
export const API_SUFFIX = `${API.HOST}.${API.DOMAIN}:${API.PORT}`;

/**
 * Suffix of Real time url: host.domain:port
 */
export const REALTIME_SUFFIX = `${API.HOST}.${API.DOMAIN}${API.REAL_TIME.ENDPOINT}`;

/**
 * Default API key alias
 */
export const APIKEY_DEFAULT_ALIAS = "apikey";

/**
 * Strips trailling slashes at the end of an URL
 */
export function stripUrlSlashes(url: string | null | undefined): string {
  return (url || "").replace(/\/+$/, "");
}

/**
 * Fallback to default zone when zone isn't provided
 */
export function getZone(zone: string | null | undefined): string {
  return zone || DEFAULT_PROJECT_ZONE;
}

/**
 * Gets the composed API URL of a given project
 */
export function getApiUrl({ projectID, zone, projectURL }: IAuthOptions): string {
  return stripUrlSlashes(projectURL) || [
    API.PROTOCOL,
    projectID,
    `.${getZone(zone)}.`,
    API_SUFFIX,
  ].join("");
}

/**
 * Gets the composed URL of a given project for RTC Module
 */
export function getRtcUrl({ projectID, zone, projectURL }: IAuthOptions, token: string): string {
  const tokenParam = `?access_token=${token}`;

  if (projectURL) {
    return [
      stripUrlSlashes(projectURL).replace(/^https?:\/\//i, API.REAL_TIME.PROTOCOL),
      API.REAL_TIME.ENDPOINT,
      tokenParam,
    ].join("");
  }

  return [
    API.REAL_TIME.PROTOCOL,
    projectID,
    `.${getZone(zone)}.`,
    REALTIME_SUFFIX,
    tokenParam,
  ].join("");
}

/**
 * Gets the project id from the url or empty if it's not found
 */
function getProjectIdFromUrl(projectURL?: string | null): string {
  const uuidRegex = /[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i;
  const match = (projectURL || "").match(uuidRegex);

  return match ? match[0] : "";
}

/**
 * Gets the projectID from the config
 */
export function getProjectId({ projectID, projectURL }: Pick<IAuthOptions, "projectID" | "projectURL">): string {
  return projectID || getProjectIdFromUrl(projectURL);
}
