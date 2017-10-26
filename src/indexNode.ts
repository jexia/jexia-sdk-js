import Client from "./api/core/client";
import { IModule } from "./api/core/module";
import DataOperationsModule from "./api/dataops/dataOperationsModule";
import { combineCriteria, field } from "./api/dataops/filteringApi";
import { RTCModule } from "./api/realtime/rtcModule";

function jexiaClient(fetchFunc: Function): Client {
  return new Client(fetchFunc);
}

function realTime(messageReceivedCallback: Function, webSocketCreateCallback: Function): RTCModule {
  return new RTCModule(messageReceivedCallback, webSocketCreateCallback);
}

function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}

export {
  combineCriteria,
  dataOperations,
  field,
  jexiaClient,
  IModule,
  realTime,
};
