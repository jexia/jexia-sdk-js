import { Fetch } from "jexia-sdk-js/internal/requestAdapter";
import fetch from "node-fetch";
import { Client } from "./api/core/client";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
export * from "./index";

export function jexiaClient(fetchFunc: Fetch = fetch as any): Client {
  return new Client(fetchFunc);
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}
