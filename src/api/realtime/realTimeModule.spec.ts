import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { of, throwError } from "rxjs";
import { createMockFor, SpyObj, validClientOpts } from "../../../spec/testUtils";
import { RequestExecuter } from "../../../src/internal/executer";
import { MESSAGE, getRtcUrl } from "../../config";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { IWebSocket, WebSocketState } from "./realTime.interfaces";
import { RealTimeModule } from "./realTimeModule";

describe("Real Time Module", () => {

  const shouldHaveFailed = "Should have failed!";

  function createSubject({
    webSocketMock = createMockFor(["send", "close"]) as SpyObj<IWebSocket>,
    websocketBuilder = jasmine.createSpy().and.returnValue(webSocketMock),
    token = faker.random.alphaNumeric(36),
    tokenManagerReturnValue = of(token),
    tokenManagerMock = createMockFor(TokenManager, {}, { token: () => tokenManagerReturnValue }),
    injectorMock = createMockFor(["get", "resolveAndCreateChild"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [AuthOptions, validClientOpts],
      [RequestExecuter, createMockFor(RequestExecuter)]
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    injectorMock.resolveAndCreateChild.mockImplementation(() => injectorMock);
    const subject = new RealTimeModule(websocketBuilder);
    return {
      token,
      webSocketMock,
      websocketBuilder,
      injectorMock,
      tokenManagerMock,
      subject,
      moduleInit() {
        const promise = subject.init(injectorMock);
        tokenManagerMock.token().toPromise().then(() => webSocketMock.onopen && webSocketMock.onopen({}));
        return promise;
      },
    };
  }

  describe("when initializing", () => {

    it("should start the websocket connection with the correct app url", async () => {
      const { websocketBuilder, moduleInit, token } = createSubject();
      await moduleInit();
      expect(websocketBuilder).toHaveBeenCalledWith(getRtcUrl(validClientOpts, token));
    });

    it("should start dataset watch functionality after initialized with correct parameters", async () => {
      const { webSocketMock, moduleInit, tokenManagerMock } = createSubject();
      const websocket = require("./websocket");
      spyOn(websocket, "start");
      await moduleInit();
      expect(websocket.start).toHaveBeenCalledWith(webSocketMock, jasmine.any(Function));
      const token = (websocket.start as jasmine.Spy).calls.mostRecent().args[1]();
      expect(token).toStrictEqual(tokenManagerMock.token().toPromise());
    });

    it("should not start dataset watch functionality if not initialized", async () => {
      const { moduleInit, websocketBuilder } = createSubject();
      const websocket = require("./websocket");
      spyOn(websocket, "start");
      websocketBuilder.and.callFake(() => { throw new Error("builderError"); });
      try {
        await moduleInit();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).not.toBe(shouldHaveFailed);
        expect(websocket.start).not.toHaveBeenCalled();
      }
    });

    it("should reject the initializing promise when the websocket builder returns an falsy value", async () => {
      const { websocketBuilder, moduleInit } = createSubject();
      websocketBuilder.and.returnValue(undefined);
      try {
        await moduleInit();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).toBe(MESSAGE.RTC.BAD_WEBSOCKET_CREATION_CALLBACK);
      }
    });

    it("should reject the initializing promise when the websocket builder throws an error", async () => {
      const builderError = "builderErrorMessage";
      const { websocketBuilder, moduleInit } = createSubject();
      websocketBuilder.and.callFake(() => { throw new Error(builderError); });
      try {
        await moduleInit();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).toContain(MESSAGE.RTC.ERROR_CREATING_WEBSOCKET);
        expect(error.message).toContain(builderError);
      }
    });

    it("should reject the initializing promise when there is an error on token promise", async () => {
      const tokenError = "tokenErrorTest";
      const { subject, injectorMock } = createSubject({
        tokenManagerReturnValue: throwError(tokenError),
      });
      try {
        await subject.init(injectorMock);
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error).toBe(tokenError);
      }
    });

    it("should reject the initializing promise when the websocket has an error event", async () => {
      const { subject, webSocketMock, tokenManagerMock, injectorMock } = createSubject();
      const initPromise = subject.init(injectorMock);
      tokenManagerMock.token().toPromise().then(() => webSocketMock.onerror("webSocketError"));
      try {
        await initPromise;
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).toBe(MESSAGE.RTC.CONNECTION_FAILED);
      }
    });

  });

  describe("when gets a module config", () => {
    it("should return an empty config", () => {
      const { subject } = createSubject();
      expect(subject.getConfig()).toEqual({ rtc: {} });
    });
  });

  describe("when terminating", () => {

    it("should resolve the terminating promise immediately if the websocket is closed already", async () => {
      const { subject, webSocketMock, moduleInit } = createSubject();
      await moduleInit();
      (webSocketMock as any).readyState = WebSocketState.CLOSED;
      await subject.terminate();
      expect(webSocketMock.close).not.toHaveBeenCalled();
    });

    it("should resolve the terminating promise only after the websocket close event", async () => {
      const { subject, webSocketMock, moduleInit } = createSubject();
      await moduleInit();
      let oncloseEvent = false;
      setTimeout(() => {
        webSocketMock.onclose({});
        oncloseEvent = true;
      }, 100);
      await subject.terminate().then(() => {
        expect(oncloseEvent).toBeTruthy();
        expect(webSocketMock.close).toHaveBeenCalledWith();
      });
    });

    it("should reject the terminating promise when the websocket has an error event", async () => {
      const { subject, webSocketMock, moduleInit } = createSubject();
      await moduleInit();
      const webSocketError = "webSocketError";
      webSocketMock.close.mockImplementation(() => webSocketMock.onerror(webSocketError));
      try {
        await subject.terminate();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error).toBe(webSocketError);
      }
    });

  });

});
