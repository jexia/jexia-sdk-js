import { Client } from "./api/core/client";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
export * from "./index";

export function jexiaClient(fetchFunc: Function): Client {
  return new Client(fetchFunc);
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}
