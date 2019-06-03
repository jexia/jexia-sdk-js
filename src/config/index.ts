import { API as DEFAULT_API, DELAY } from "./config";

let API = DEFAULT_API;

/* for development purpose */
if (process && process.env && process.env.JEXIA_DEV_DOMAIN) {
  API.DOMAIN = process.env.JEXIA_DEV_DOMAIN;
}

/* Configuration */
export { API, DELAY };

/* Messages */
export * from "./message";
