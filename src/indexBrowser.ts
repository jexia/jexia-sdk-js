import Client from "./api/core/client";
import { IModule } from "./api/core/module";
import DataOperationsModule from "./api/dataops/dataOperationsModule";
import { combineCriteria, field } from "./api/dataops/filteringApi";
import { RTCModule } from "./api/realtime/rtcModule";

function jexiaClient(): Client {
  return new Client(window.fetch.bind(window));
}

function realTimeModule(messageReceivedCallback: Function): RTCModule {
  return new RTCModule(messageReceivedCallback, (appUrl: string) => {
    return new WebSocket(appUrl);
  });
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
  realTimeModule,
};
