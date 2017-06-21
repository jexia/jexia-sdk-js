import Client from "./client";
import { IModule } from "./module";

/* use native browser fetch */
(global as any).fetch = window.fetch.bind(window);

export {
  Client,
  IModule,
};
