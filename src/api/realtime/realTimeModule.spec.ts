import * as faker from "faker";
import { ReflectiveInjector } from "injection-js";
import { of, throwError } from "rxjs";
import { createMockFor, SpyObj, validClientOpts } from "../../../spec/testUtils";
import { RequestExecuter } from "../../../src/internal/executer";
import { MESSAGE, getRtcUrl } from "../../config";
import { AuthOptions, TokenManager } from "../core/tokenManager";
import { Dispatcher } from "../core/dispatcher";
import { IWebSocket, WebSocketState } from "./realTime.interfaces";
import { RealTimeModule } from "./realTimeModule";

describe("Real Time Module", () => {

  const shouldHaveFailed = "Should have failed!";
  const dispatcherEvents =  [
    "tokenLogin",
    "tokenRefresh",
    "umsLogin",
    "umsSwitchUser",
    "umsLogout",
  ];

  function createSubject({
    webSocketMock = createMockFor(["send", "close"]) as SpyObj<IWebSocket>,
    websocketBuilder = jasmine.createSpy().and.returnValue(webSocketMock),
    token = faker.random.alphaNumeric(36),
    tokenManagerReturnValue = of(token),
    tokenManagerMock = createMockFor(TokenManager, {}, { token: () => tokenManagerReturnValue }),
    injectorMock = createMockFor(["get", "resolveAndCreateChild"]) as SpyObj<ReflectiveInjector>,
    dispatcherMock = new Dispatcher(), // we need to call the emit function, so we pass the real class here
  } = {}) {
    const injectorMap = new Map<any, any>([
      [TokenManager, tokenManagerMock],
      [AuthOptions, validClientOpts],
      [RequestExecuter, createMockFor(RequestExecuter)],
      [Dispatcher, dispatcherMock],
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
      async moduleConnect() {
        await subject.init(injectorMock);
        const promise = (subject as any).connect();
        tokenManagerMock.token().toPromise().then(() => webSocketMock.onopen && webSocketMock.onopen({}));
        return promise;
      },
      dispatcherMock,
    };
  }

  describe("when initializing", () => {
    it("should subscribe to the system events", async () => {
      const { subject, injectorMock } = createSubject();

      spyOn((subject as any), "listenToEvents");
      await subject.init(injectorMock);

      expect((subject as any).listenToEvents).toHaveBeenCalled();
    });
  });

  describe("listen to system events", () => {
    dispatcherEvents.forEach(event => {
      it(`should subscribe to the event ${event}`, async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn(dispatcherMock, "on");
        await subject.init(injectorMock); // events are subscribe inside the init function

        expect(dispatcherMock.on).toHaveBeenCalledWith(event, "rtcConnect", expect.anything());
      });
    });

    describe("receiving event: TokenLogin", () => {
      it("should connect when there is no open connection", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn((subject as any), "connect");
        await subject.init(injectorMock);
        dispatcherMock.emit("tokenLogin");

        expect((subject as any).connect).toHaveBeenCalled();
      });

      it("should set the tokensGivenOnInit marker to TRUE", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        await subject.init(injectorMock);
        dispatcherMock.emit("tokenLogin");

        expect((subject as any).tokensGivenOnInit).toBe(true);
      });
    });

    describe("receiving event: tokenRefresh", () => {
      it("should set the new token for the websocket", async () => {
        const { subject, dispatcherMock, injectorMock, websocketBuilder } = createSubject();

        spyOn((subject as any), "refreshToken");
        await subject.init(injectorMock);
        (subject as any).websocket = websocketBuilder;
        dispatcherMock.emit("tokenRefresh");

        expect((subject as any).refreshToken).toHaveBeenCalled();
      });
    });

    describe("receiving event: umsLogin", () => {
      it("should throw an error when using tokens via the jexiaClient().init()", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn((subject as any), "throwUmsErrorIfNeeded");
        await subject.init(injectorMock);
        dispatcherMock.emit("umsLogin");

        expect((subject as any).throwUmsErrorIfNeeded).toHaveBeenCalled();
      });

      it("should open a new connection when there is no connection open", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn((subject as any), "connect");
        await subject.init(injectorMock);
        dispatcherMock.emit("umsLogin");

        expect((subject as any).connect).toHaveBeenCalled();
      });

      it("should set a new token for the websocket if there is an open connection", async () => {
        const { subject, dispatcherMock, injectorMock, websocketBuilder } = createSubject();

        spyOn((subject as any), "refreshToken");
        await subject.init(injectorMock);
        (subject as any).websocket = websocketBuilder;
        dispatcherMock.emit("umsLogin");

        expect((subject as any).refreshToken).toHaveBeenCalled();
      });
    });

    describe("receiving event: umsSwitchUser", () => {
      it("should throw an error when using tokens via the jexiaClient().init()", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn((subject as any), "throwUmsErrorIfNeeded");
        await subject.init(injectorMock);
        dispatcherMock.emit("umsSwitchUser");

        expect((subject as any).throwUmsErrorIfNeeded).toHaveBeenCalled();
      });

      it("should set a new token for the websocket", async () => {
        const { subject, dispatcherMock, injectorMock, websocketBuilder } = createSubject();

        spyOn((subject as any), "refreshToken");
        await subject.init(injectorMock);
        (subject as any).websocket = websocketBuilder;
        dispatcherMock.emit("umsSwitchUser");

        expect((subject as any).refreshToken).toHaveBeenCalled();
      });
    });

    describe("receiving event: umsLogout", () => {
      it("should throw an error when using tokens via the jexiaClient().init()", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn((subject as any), "throwUmsErrorIfNeeded");
        await subject.init(injectorMock);
        dispatcherMock.emit("umsLogout");

        expect((subject as any).throwUmsErrorIfNeeded).toHaveBeenCalled();
      });

      it("should terminate the connection", async () => {
        const { subject, dispatcherMock, injectorMock } = createSubject();

        spyOn(subject, "terminate");
        await subject.init(injectorMock);
        dispatcherMock.emit("umsLogout");

        expect((subject as any).terminate).toHaveBeenCalled();
      });
    });
  });

  describe("when connecting", () => {

    it("should start the websocket connection with the correct app url", async () => {
      const { websocketBuilder, moduleConnect, token } = createSubject();
      await moduleConnect();

      expect(websocketBuilder).toHaveBeenCalledWith(getRtcUrl(validClientOpts, token));
    });

    it("should start dataset watch functionality after initialized with correct parameters", async () => {
      const { webSocketMock, moduleConnect, tokenManagerMock } = createSubject();
      const websocket = require("./websocket");
      spyOn(websocket, "start");
      await moduleConnect();
      expect(websocket.start).toHaveBeenCalledWith(webSocketMock, jasmine.any(Function));
      const token = (websocket.start as jasmine.Spy).calls.mostRecent().args[1]();
      expect(token).toStrictEqual(tokenManagerMock.token().toPromise());
    });

    it("should not start dataset watch functionality if not initialized", async () => {
      const { moduleConnect, websocketBuilder } = createSubject();
      const websocket = require("./websocket");
      spyOn(websocket, "start");
      websocketBuilder.and.callFake(() => { throw new Error("builderError"); });
      try {
        await moduleConnect();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).not.toBe(shouldHaveFailed);
        expect(websocket.start).not.toHaveBeenCalled();
      }
    });

    it("should reject the initializing promise when the websocket builder returns a falsy value", async () => {
      const { websocketBuilder, moduleConnect } = createSubject();
      websocketBuilder.and.returnValue(undefined);
      try {
        await moduleConnect();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error.message).toBe(MESSAGE.RTC.BAD_WEBSOCKET_CREATION_CALLBACK);
      }
    });

    it("should reject the initializing promise when the websocket builder throws an error", async () => {
      const builderError = "builderErrorMessage";
      const { websocketBuilder, moduleConnect } = createSubject();
      websocketBuilder.and.callFake(() => { throw new Error(builderError); });
      try {
        await moduleConnect();
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
        await (subject as any).connect();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error).toBe(tokenError);
      }
    });

    it("should reject the initializing promise when the websocket has an error event", async () => {
      const { subject, webSocketMock, tokenManagerMock, injectorMock } = createSubject();
      await subject.init(injectorMock);
      const initPromise = (subject as any).connect();
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
    it("should resolve the terminating promise immediately if the websocket object does not exists", async () => {
      const { subject, webSocketMock } = createSubject();
      await subject.terminate();
      expect(webSocketMock.close).not.toHaveBeenCalled();
    });

    it("should resolve the terminating promise immediately if the websocket is closed already", async () => {
      const { subject, webSocketMock, moduleConnect } = createSubject();
      await moduleConnect();
      (webSocketMock as any).readyState = WebSocketState.CLOSED;
      await subject.terminate();
      expect(webSocketMock.close).not.toHaveBeenCalled();
    });

    it("should resolve the terminating promise only after the websocket close event", async () => {
      const { subject, webSocketMock, moduleConnect } = createSubject();
      await moduleConnect();
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
      const { subject, webSocketMock, moduleConnect } = createSubject();
      await moduleConnect();
      const webSocketError = "webSocketError";
      webSocketMock.close.mockImplementation(() => webSocketMock.onerror(webSocketError));
      try {
        await subject.terminate();
        throw new Error(shouldHaveFailed);
      } catch (error) {
        expect(error).toBe(webSocketError);
      }
    });

    it("should unsubscribe from the Dispatcher events", async () => {
      const { subject, webSocketMock, moduleConnect, dispatcherMock } = createSubject();

      spyOn(dispatcherMock, "off");
      await moduleConnect();
      setTimeout(() => {
        webSocketMock.onclose({});
      }, 100);
      await subject.terminate();
      dispatcherEvents.forEach(
        (event, key) => expect(dispatcherMock.off).toHaveBeenNthCalledWith(key + 1, event, "rtcConnect"),
      );
    });

  });

  it("should send a refreshToken / setToken on the websocket connection", () => {
    const { subject, injectorMock } = createSubject();
    const websocket = require("./websocket");

    subject.init(injectorMock);
    spyOn(websocket, "refreshToken");
    (subject as any).refreshToken();

    expect(websocket.refreshToken).toHaveBeenCalled();
  });

});
