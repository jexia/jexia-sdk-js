// tslint:disable:object-literal-sort-keys
export const API = {
  AUTH: {
    // TODO remove user_credentials auth
    USER_CREDENTIALS: "auth",
    API_KEY: "auth",
    UMS: "auth",
  },
  DATA: {
    ENDPOINT: "ds",
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/rtc?Authorization=",
    PORT: "",
    PROTOCOL: "wss",
  },
  UMS: {
    ENDPOINT: "/users",
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
