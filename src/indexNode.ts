import fetch from "node-fetch";
import Client from "./client";

/* use node-fetch globally for node */
(global as any).fetch = fetch;

export {
  Client,
};
