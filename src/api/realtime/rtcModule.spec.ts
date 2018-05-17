// tslint:disable:max-line-length
// tslint:disable:max-classes-per-file
import { createMockFor } from "../../../spec/testUtils";
import { API } from "../../config/config";
import { MESSAGE } from "../../config/message";
import { RequestExecuter } from "../../internal/executer";
import { IRequestAdapter, IRequestOptions } from "../../internal/requestAdapter";
import { Dataset } from "../dataops/dataset";
import { RTCModule } from "./rtcModule";

class BaseWebSocketMock {
  public url: string;
  public onopen: Function;
  public onclose: Function;
  public onmessage: Function;
  public onerror: Function;
  private sendCallback: Function;

  constructor(url: string, constructTimeCallback: Function, sendCallback?: Function) {
    this.url = url;
    this.sendCallback = sendCallback ? sendCallback : (message: String) => message;
    setTimeout(constructTimeCallback, 100);
  }

  public close() {
    setTimeout(() => this.onclose(), 100);
  }

  public send(message: String) {
    this.sendCallback(message);
  }

  public message(message: MessageEvent) {
    this.onmessage(message);
  }
}

class WebSocketMock extends BaseWebSocketMock {
  constructor(url: string, sendCallback?: Function) {
    super(url, () => this.onopen(), sendCallback);
  }
}

class ConnectionCloseWebSocketMock extends BaseWebSocketMock {
  constructor(url: string, sendCallback?: Function) {
    super(url, () => this.onclose({code: 1}), sendCallback);
  }
}

class ConnectionErrorWebSocketMock extends BaseWebSocketMock {
  constructor(url: string, sendCallback?: Function) {
    super(url, () => this.onerror(), sendCallback);
  }
}

const createMocks: any = (validToken: string) => {
  return {
    reqAdapterMock: {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    },
    tokenManagerMock: {
      get token(): Promise<string> {
        return Promise.resolve(validToken);
      },
    },
  };
};

describe("RTCModule class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: any;
  let validToken: string = "validtoken";
  let testProjectID = "testproject";

  beforeEach(() => {
    const mocks = createMocks(validToken);
    tokenManagerMock = mocks.tokenManagerMock;
    reqAdapterMock = mocks.reqAdapterMock;
  });

  describe("when initializing the RTCModule", () => {
    it("should pass the proper URL to the websocket client library", (done) => {
      let rtcm: any = new RTCModule(() => { return; }, (url: string) => new WebSocketMock(url) );
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        const wsURL = `${API.REAL_TIME.PROTOCOL}://${testProjectID}.${API.HOST}.${API.DOMAIN}` +
          `${API.REAL_TIME.PORT}${API.REAL_TIME.ENDPOINT}/${validToken}`;
        expect(rtcm.websocket.url).toEqual(wsURL);
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });

    function testInitialisationErrors(mockCreationCallback: Function, expectedError: String, done: any) {
      let rtcm: any = new RTCModule(() => { return; }, mockCreationCallback );
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        done.fail("Initialization should have failed");
      }).catch( (error: Error) => {
        expect(error.message).toEqual(expectedError);
        done();
      });
    }

    it("should gracefully notify the user if the connection could not be established and the onclose websocket event is raised", (done) => {
      testInitialisationErrors(
        (url: string) => new ConnectionCloseWebSocketMock(url), // use this mock for init
        `${MESSAGE.RTC.CONNECTION_CLOSED}1`, // expect this error; 1 is the error code thrown by our mocking logic
        done,
      );
    });

    it("should gracefully notify the user if the connection could not be established and the onerror websocket event is raised", (done) => {
      testInitialisationErrors(
        (url: string) => new ConnectionErrorWebSocketMock(url), // use this mock for init
        `${MESSAGE.RTC.CONNECTION_FAILED}`, // expect this error
        done,
      );
    });
  });

  describe("when subscribing to events for a dataset", () => {
    const datasetName: string = "datasetName";
    const actionName: string = "get";
    let rtcm: any;
    let ds: Dataset;
    let webSockerMock: WebSocketMock;

    beforeAll(() => {
      rtcm = new RTCModule(() => {/* */}, (url: string) => {
        webSockerMock = new WebSocketMock(url);
        return webSockerMock;
      });
      ds = new Dataset(datasetName, createMockFor(RequestExecuter));
    });

    it("should send the proper JSON message to Sharky", (done) => {
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        spyOn(rtcm, "send");
        rtcm.subscribe(actionName, ds);
        expect(rtcm.send).toHaveBeenCalledWith({ nsp: `${datasetName}.${actionName}`,
          type: "subscribe",
        });
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });

    it("should delete the right dictionary function", (done) => {
      const alternateAction = "post";
      const errorMessage = (type: string) => `Subscription promise should not been ${type} triggered yet`;
      const subscribeMessage = <MessageEvent> {
        data: `{"type":"subscribe","status":"success","nsp":"${rtcm.buildSubscriptionUri(alternateAction, datasetName)}"}`,
      };
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        rtcm
          .subscribe(actionName, ds)
          .then(() => done.fail(errorMessage("resolved")))
          .catch(() => done.fail(errorMessage("rejected")));
        rtcm
          .subscribe(alternateAction, ds)
          .then((message: Object) => {
            expect(message).toEqual(subscribeMessage);
            expect(rtcm.pendingSubscriptionRequests()).toEqual([rtcm.buildSubscriptionUri(actionName, datasetName)]);
            done();
          })
          .catch(() => done.fail("Subscription should not have failed"));

        webSockerMock.message(subscribeMessage);

      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });

    it("should get rejected promise when subscription is not successful", (done) => {
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        rtcm
          .subscribe(actionName, ds)
          .then(() => done.fail("Subscription should not have succeded"))
          .catch(() => done());
        webSockerMock.message(<MessageEvent> {
          data: `{"type":"subscribe","status":"failure","nsp":"${rtcm.buildSubscriptionUri(actionName, datasetName)}"}`,
        });
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });
  });

  describe("when unsubscribing from events for a dataset", () => {
    it("should send the proper JSON message to Sharky", async () => {
      const rtcm: any = new RTCModule(() => {/* */}, (url: string) => new WebSocketMock(url) );
      const datasetName = "datasetName";
      const actionName = "get";
      const ds = new Dataset(datasetName, createMockFor(RequestExecuter));
      await rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock);
      spyOn(rtcm, "send");
      rtcm.unsubscribe(actionName, ds);
      expect(rtcm.send).toHaveBeenCalledWith({ nsp: `${datasetName}.${actionName}`,
        type: "unsubscribe",
      });
    });
  });

  describe("when receiving a message from Sharky", () => {
    let rtcm: any;
    let testCallback: Function;
    let initializeRTC: Promise<any>;

    beforeAll(() => {
      const mocks = createMocks(validToken);
      testCallback = jest.fn();
      tokenManagerMock = mocks.tokenManagerMock;
      reqAdapterMock = mocks.reqAdapterMock;
      rtcm = new RTCModule(testCallback, (url: string) => new WebSocketMock(url) );
    });

    beforeEach(() => {
      initializeRTC = rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock);
    });

    it("should not forward the message when type is not 'event'", (done) => {
      const result: object = { data: '{"type": "success", "data": "result"}' };
      initializeRTC.then( () => {
        rtcm.websocket.onmessage(result);
        expect(testCallback).not.toHaveBeenCalled();
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });

    it("should forward the message to the client defined callback", (done) => {
      const eventType = "anEvent";
      const eventValue = "result";
      const result: object = { data: `{"type": "event", "nsp": "${eventType}", "data": "${eventValue}"}` };
      initializeRTC.then( () => {
        rtcm.websocket.onmessage(result);
        expect(testCallback).toHaveBeenCalledWith({data: eventValue, event: eventType});
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });

    it("should not crash when the messageReceivedCallback supplied by the client code throws an error", (done) => {
      const result: object = { data: '{"type": "event", "data": "result"}' };
      const genericError: string = "some client code error";
      const expectedErrorMessage: string = `${MESSAGE.RTC.EXCEPTION_IN_CLIENT_CALLBACK}${new Error(genericError)}`;
      const errorLengthToCompare = 120;
      rtcm = new RTCModule( () => { throw new Error(genericError); }, (url: string) => new WebSocketMock(url) );
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock).then( () => {
        try {
          rtcm.websocket.onmessage(result);
        } catch (err) {
          // only comparing the first part of the error, as the latter part includes the original callstack, before the
          // SDK rethrows. That part isn't reproducible for comparison so the test would never pass if we tested it.
          expect(err.message.substring(0, errorLengthToCompare)).toEqual(expectedErrorMessage.substring(0, errorLengthToCompare));
          done();
          return;
        }
        done.fail("The call should have failed.");
      }).catch( () => {
        done.fail("Initialization shouldn't have failed.");
      });
    });
  });

  describe("when sending a message before opening the connection", () => {
    const errMess: string = "The RTC Module seems to be missing a valid websocket object. Did you properly initialize the RTC Module by calling the init method?";

    it("should throw an useful error", () => {
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => new WebSocketMock(url));
      // you can find the actual error message in rtcmodule.ts / RTCModule file
      // The idea is to make sure we catch the underlying exception and give
      // a useful error message instead.
      expect( () => rtcm.send("test")).toThrow(errMess);
    });

    it("should throw an useful error part 2", (done) => {
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => new WebSocketMock(url, () => { throw new Error("not opened"); }));
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock)
        .then( () => { return; } )
        .catch( (error: Error) => {
          done.fail("Initializing the RTCModule should not have failed.");
        });
      expect( () => rtcm.send("test")).toThrow(errMess);
      done();
    });
  });

  describe("when sending a message after closing the connection", () => {
    it("should throw a useful error", (done) => {
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => new WebSocketMock(url, () => { throw new Error("not opened"); }));
      const errMess: string = "The connection seems to be closed. Did you properly initialize the RTC Module by calling the init method? Or maybe you terminated the RTC Module early?";
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock)
        .then( () => {
          rtcm.terminate().then( () => {
            expect( () => rtcm.send("test")).toThrow(errMess);
            done();
          });
        }).catch( (error: Error) => {
          done.fail("Initializing the RTCModule should not have failed.");
        });
    });
  });

  describe("when supplying an invalid websocket creation callback", () => {
    it("should signal the problem with an appropriate error", (done) => {
      const errMess = "The callback you supplied for websocket creation threw an error. You might want to call it yourself and debug it to see what's wrong. Original error:";
      const mockErr = "Something went terribly wrong.";
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => { throw new Error(mockErr); });
      rtcm.init(testProjectID, tokenManagerMock, reqAdapterMock)
        .then( () => {
          done.fail("Initializing the RTCModule should have failed.");
        }).catch( (error: Error) => {
          expect(error.message).toEqual(`${errMess} ${mockErr}`);
          done();
        });
    });
  });
});
