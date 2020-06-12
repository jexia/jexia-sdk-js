import { API as DEFAULT_API, DELAY, DEFAULT_PROJECT_ZONE, getApiUrl } from "./config";

const API = DEFAULT_API;

const isNodeJS = typeof process === "object";

// for development purposes we override domain in order to run e2e tests in a given environment
if (isNodeJS && process.env && process.env.JEXIA_DEV_DOMAIN) {
  API.DOMAIN = process.env.JEXIA_DEV_DOMAIN;
}

/* Configuration */
export { API, DELAY, DEFAULT_PROJECT_ZONE, getApiUrl };

/* Messages */
export * from "./message";
