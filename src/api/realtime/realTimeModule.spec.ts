// tslint:disable:no-string-literal
// tslint:disable:no-empty
import { ReflectiveInjector } from "injection-js";
import { createMockFor, SpyObj } from "../../../spec/testUtils";
import { MESSAGE } from "../../config/message";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { IWebSocket, WebSocketState } from "./realTime.interfaces";
import { RealTimeModule } from "./realTimeModule";

describe("Real Time Module", () => {

  const projectID = "projectIDTest";
  const tokenTest = "tokenTest";
  const shouldHaveFailed = "Should have failed!";

  function createSubject({
    webSocketMock = createMockFor(["send", "close"]) as SpyObj<IWebSocket>,
    websocketBuilder = jasmine.createSpy().and.returnValue(webSocketMock),
    tokenPromise = Promise.resolve(tokenTest),
    tokenManagerMock = createMockFor(TokenManager),
    injectorMock = createMockFor(["get"]) as SpyObj<ReflectiveInjector>,
  } = {}) {
    (tokenManagerMock as any)["token"] = tokenPromise;
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [AuthOptions, { projectID }],
    ]);
    injectorMock.get.mockImplementation((key: any) => injectorMap.get(key));
    const subject = new RealTimeModule(websocketBuilder);
    return {
      projectID,
      webSocketMock,
      websocketBuilder,
      injectorMock,
      tokenManagerMock,
      subject,
      moduleInit() {
        const promise = subject.init(injectorMock);
        tokenPromise.then(() => webSocketMock.onopen && webSocketMock.onopen({}));
        return promise;
      },
    };
  }

  describe("when initializing", () => {

    it("should start the websocket connection with the correct app url", async () => {
      const { websocketBuilder, moduleInit } = createSubject();
      await moduleInit();
      expect(websocketBuilder).toHaveBeenCalledWith(
        "ws://projectIDTest.app.jexia.local/rtc?Authorization=tokenTest",
      );
    });

    it("should start dataset watch functionality after initialized with correct parameters", async () => {
      const { webSocketMock, moduleInit, tokenManagerMock } = createSubject();
      const datasetWatch = require("./datasetWatch");
      spyOn(datasetWatch, "start");
      await moduleInit();
      expect(datasetWatch.start).toHaveBeenCalledWith(webSocketMock, jasmine.any(Function));
      const token = (datasetWatch.start as jasmine.Spy).calls.mostRecent().args[1]();
      expect(token).toBe(tokenManagerMock.token);
    });

    it("should not start dataset watch functionality if not initialized", async () => {
      const { moduleInit, websocketBuilder } = createSubject();
      const datasetWatch = require("./datasetWatch");
      spyOn(datasetWatch, "start");
      websocketBuilder.and.callFake(() => { throw new Error("builderError"); });
      try {
        await moduleInit();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).not.toBe(shouldHaveFailed);
        expect(datasetWatch.start).not.toHaveBeenCalled();
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
      const { subject, injectorMock } = createSubject({ tokenPromise: Promise.reject(tokenError) });
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
      tokenManagerMock.token.then(() => webSocketMock.onerror("webSocketError"));
      try {
        await initPromise;
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).toBe(MESSAGE.RTC.CONNECTION_FAILED);
      }
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
