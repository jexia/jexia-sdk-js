// tslint:disable:object-literal-sort-keys
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
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
