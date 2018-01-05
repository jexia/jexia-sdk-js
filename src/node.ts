import { Client } from "./api/core/client";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
import { RTCModule } from "./api/realtime/rtcModule";
export * from "./index";

export function jexiaClient(fetchFunc: Function): Client {
  return new Client(fetchFunc);
}

export function realTime(messageReceivedCallback: Function, webSocketCreateCallback: Function): RTCModule {
  return new RTCModule(messageReceivedCallback, webSocketCreateCallback);
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}
