import fetch from "node-fetch";
import Client from "./client";
import { IModule } from "./module";

/* use node-fetch globally for node */
(global as any).fetch = fetch;

export {
  Client,
  IModule,
};
