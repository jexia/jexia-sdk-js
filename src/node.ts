export * from "./index";
import * as FormData from 'form-data';
import { ReadStream } from 'fs';
import fetch from "node-fetch";
import * as NodeWebSocket from "ws";
import { Client } from "./api/core/client";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
import { FileOperationsModule } from "./api/fileops/fileOperationsModule";
import { FileOperationsConfig } from "./api/fileops/fileops.interfaces";
import { LoggerModule, LogLevel } from "./api/logger/public-api";
import { IWebSocketBuilder } from "./api/realtime/realTime.interfaces";
import { RealTimeModule } from "./api/realtime/realTimeModule";
import { Fetch } from "./internal/requestAdapter";

export function jexiaClient(fetchFunc: Fetch = fetch as any): Client {
  return new Client(fetchFunc);
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}

export function fileOperations(config: Partial<FileOperationsConfig> = {}): FileOperationsModule<FormData, ReadStream> {
  return new FileOperationsModule(new FormData(), config);
}

export function realTime(webSocketBuilder: IWebSocketBuilder = (appUrl) => new NodeWebSocket(appUrl)): RealTimeModule {
  return new RealTimeModule(webSocketBuilder);
}

export function logger(level: LogLevel, modules?: string[]) {
  return new LoggerModule(level, modules);
}

export * from "./api/logger/public-api";
export * from "./api/ums/public-api";
