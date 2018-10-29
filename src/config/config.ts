// tslint:disable:object-literal-sort-keys
export const API = {
  AUTH: {
    USER_CREDENTIALS: "auth",
    API_KEY: "auth",
  },
  DATA: {
    ENDPOINT: {
      /* We are going to use REST API endpoint for create (insert) records and delete records by id(s) */
      REST: "ds/r",
      /* Use QUERY endpoint for any queries that have conditions, such as select, update and delete */
      QUERY: "ds/q",
    },
  },
  FILES: {
    ENDPOINT: "fs",
  },
  REAL_TIME: {
    ENDPOINT: "/rtc?Authorization=",
    PORT: "",
    PROTOCOL: "wss",
  },
  DOMAIN: "com",
  HOST: "app.jexia",
  PORT: 443,
  PROTOCOL: "https",
};

/* default refresh token interval: 1 hour and 50 minutes; JEXIA tokens expire in 2 hours */
export const DELAY = 1000 * 60 * 110;
