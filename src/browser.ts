export * from "./index";
import { Client } from "./api/core/client";
import { TokenStorage, WebStorageComponent } from "./api/core/componentStorage";
import { DataOperationsModule } from "./api/dataops/dataOperationsModule";
import { LoggerModule, LogLevel } from "./api/logger/public-api";
import { IWebSocketBuilder } from "./api/realtime/realTime.interfaces";
import { RealTimeModule } from "./api/realtime/realTimeModule";

/**
 * It checks if the browser is capable of using the Web Storage API
 */
function storageAvailable(type: string) {
  const storage = type === "localStorage" ? window.localStorage : window.sessionStorage;
  const testString = "test";
  try {
    storage.setItem(testString, testString);
    storage.getItem(testString);
    storage.removeItem(testString);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === "QuotaExceededError" ||
      // Firefox
      e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there"s something already stored
      storage.length !== 0;
  }
}

/**
 * If Web Storage is available then uses the Client with local storage component
 */
if (storageAvailable("localStorage") && storageAvailable("sessionStorage")) {
  TokenStorage.setStorageAPI(new WebStorageComponent(true, window));
}

export function jexiaClient(): Client {
  return new Client(window.fetch.bind(window));
}

export function dataOperations(): DataOperationsModule {
  return new DataOperationsModule();
}

export function realTime(webSocketBuilder: IWebSocketBuilder = (appUrl) => new WebSocket(appUrl)): RealTimeModule {
  return new RealTimeModule(webSocketBuilder);
}

export function logger(level: LogLevel, modules?: string[]) {
  return new LoggerModule(level, modules);
}

export * from "./api/logger/public-api";
