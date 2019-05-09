export * from "./index";
import * as FormData from 'form-data';
import { ReadStream } from 'fs';
import { Fetch } from "jexia-sdk-js/internal/requestAdapter";
import fetch from "node-fetch";
import * as NodeWebSocket from "ws";
import { Client } from "./api/core/client";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
import { FileOperationsModule } from "./api/fileops/fileOperationsModule";
import { LoggerModule, LogLevel } from "./api/logger/public-api";
import { IWebSocketBuilder } from "./api/realtime/realTime.interfaces";
import { RealTimeModule } from "./api/realtime/realTimeModule";

export function jexiaClient(fetchFunc: Fetch = fetch as any): Client {
  return new Client(fetchFunc);
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}

export function fileOperations(): FileOperationsModule<FormData, ReadStream> {
  return new FileOperationsModule(new FormData());
}

export function realTime(webSocketBuilder: IWebSocketBuilder = (appUrl) => new NodeWebSocket(appUrl)): RealTimeModule {
  return new RealTimeModule(webSocketBuilder);
}

export function logger(level: LogLevel, modules?: string[]) {
  return new LoggerModule(level, modules);
}

export * from "./api/logger/public-api";
export * from "./api/ums/public-api";
