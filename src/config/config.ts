// tslint:disable:object-literal-sort-keys
export const API = {
  AUTH: {
    USER_CREDENTIALS: "auth",
    API_KEY: "auth",
  },
  DATA: {
    ENDPOINT: "sdk-api",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/rtc?Authorization=",
    PORT: "",
    PROTOCOL: "ws",
  },
  DOMAIN: "local",
  HOST: "app.jexia",
  PORT: 80,
  PROTOCOL: "http",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
