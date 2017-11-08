// tslint:disable:object-literal-sort-keys
export const API = {
  DATA: {
    ENDPOINT: "sdk-api",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/realtime",
    PORT: "",
    PROTOCOL: "wss",
  },
  AUTHURL: "auth",
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
