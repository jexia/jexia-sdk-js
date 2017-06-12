import Client from "./client";

/* use native browser fetch */
(global as any).fetch = window.fetch.bind(window);

export {
  Client,
};
