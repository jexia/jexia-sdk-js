// tslint:disable:object-literal-sort-keys
export const API = {
  AUTH: {
    USER_CREDENTIALS: "auth",
    API_KEY: "ak/authentication",
  },
  DATA: {
    ENDPOINT: "sdk-api",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "",
    PORT: ":8082",
    PROTOCOL: "wss",
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
