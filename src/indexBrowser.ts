import Client from "./api/core/client";
import { IModule } from "./api/core/module";

/* use native browser fetch */
(global as any).fetch = window.fetch.bind(window);

export {
  Client,
  IModule,
};
