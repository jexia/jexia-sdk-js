import fetch from "node-fetch";
import Client from "./api/core/client";
import { IModule } from "./api/core/module";

/* use node-fetch globally for node */
(global as any).fetch = fetch;

export {
  Client,
  IModule,
};
