// tslint:disable:max-line-length
import { Dataset } from "../src/api/dataops/dataset";
import { RTCModule } from "../src/api/realtime/rtcModule";
import { QueryExecuterBuilder } from "../src/internal/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";

class WebSocketMock {
  public url: string;
  public onopen: Function;
  public onclose: Function;
  private sendCallback: Function;

  constructor(url: string, sendCallback?: Function) {
    this.url = url;
    this.sendCallback = sendCallback ? sendCallback : (message: String) => message;
    setTimeout(() => this.onopen(), 100);
  }

  public close() {
    setTimeout(() => this.onclose(), 100);
  }

  public send(message: String) {
    this.sendCallback(message);
  }
}

const createMocks:any = function(validToken: string) {
  return {
    tokenManagerMock: {
      get token(): Promise<string> {
        return Promise.resolve(validToken);
      },
    },
    reqAdapterMock: {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    },
  };
}

describe("RTCModule class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: any;
  let validToken: string = "validtoken";
  let testurl = "www.test.url";

  beforeEach(() => {
    const mocks = createMocks(validToken);
    tokenManagerMock = mocks.tokenManagerMock;
    reqAdapterMock = mocks.reqAdapterMock;
  });

  describe("when initializing the RTCModule", () => {
    it("should pass the proper URL to the websocket client library", (done) => {
      let rtcm: any = new RTCModule(() => { return; }, (url: string) => new WebSocketMock(url) );
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock).then( () => {
        expect(rtcm.websocket.url).toEqual(`ws://${testurl}:8082/${validToken}`);
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });
  });

  describe("when subscribing to events for a dataset", () => {
    it("should send the proper JSON message to Sharky", (done) => {
      let rtcm: any = new RTCModule(() => { return; }, (url: string) => new WebSocketMock(url) );
      let datasetName: string = "datasetName";
      let actionName: string = "get";
      let qef: QueryExecuterBuilder = new QueryExecuterBuilder(testurl, reqAdapterMock, tokenManagerMock);
      let ds: Dataset = new Dataset(datasetName, qef);
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock).then( () => {
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
  });

  describe("when unsubscribing from events for a dataset", () => {
    it("should send the proper JSON message to Sharky", (done) => {
      let rtcm: any = new RTCModule(() => { return; }, (url: string) => new WebSocketMock(url) );
      let datasetName: string = "datasetName";
      let actionName: string = "get";
      let qef: QueryExecuterBuilder = new QueryExecuterBuilder(testurl, reqAdapterMock, tokenManagerMock);
      let ds: Dataset = new Dataset(datasetName, qef);
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock).then( () => {
        spyOn(rtcm, "send");
        rtcm.unsubscribe(actionName, ds);
        expect(rtcm.send).toHaveBeenCalledWith({ nsp: `${datasetName}.${actionName}`,
          type: "unsubscribe",
        });
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
      });
    });
  });

  describe("when receiving a message from Sharky", () => {
    let rtcm: any;
    let testCallback: Function;
    let initializeRTC: Promise<any>;

    beforeAll(() => {
      const mocks = createMocks(validToken);
      testCallback = jasmine.createSpy("testCallback");
      tokenManagerMock = mocks.tokenManagerMock;
      reqAdapterMock = mocks.reqAdapterMock;
      rtcm = new RTCModule(testCallback, (url: string) => new WebSocketMock(url) );
      initializeRTC = rtcm.init(testurl, tokenManagerMock, reqAdapterMock);
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
      const result: object = { data: '{"type": "event", "data": "result"}' };
      initializeRTC.then( () => {
        rtcm.websocket.onmessage(result);
        expect(testCallback).toHaveBeenCalledWith("result");
        done();
      }).catch( (error: Error) => {
        done.fail("Initializing the RTCModule should not have failed.");
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
      expect( () => rtcm.send("test")).toThrow(new Error(errMess));
    });

    it("should throw an useful error part 2", (done) => {
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => new WebSocketMock(url, () => { throw new Error("not opened"); }));
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock)
        .then( () => { return; } )
        .catch( (error: Error) => {
          done.fail("Initializing the RTCModule should not have failed.");
        });
      expect( () => rtcm.send("test")).toThrow(new Error(errMess));
      done();
    });
  });

  describe("when sending a message after closing the connection", () => {
    it("should throw a useful error", (done) => {
      let rtcm: any = new RTCModule(() => { return; },
        (url: string) => new WebSocketMock(url, () => { throw new Error("not opened"); }));
      const errMess: string = "The connection seems to be closed. Did you properly initialize the RTC Module by calling the init method? Or maybe you terminated the RTC Module early?";
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock)
        .then( () => {
          rtcm.terminate().then( () => {
            expect( () => rtcm.send("test")).toThrow(new Error(errMess));
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
      rtcm.init(testurl, tokenManagerMock, reqAdapterMock)
        .then( () => {
          done.fail("Initializing the RTCModule should have failed.");
        }).catch( (error: Error) => {
          expect(error.message).toEqual(`${errMess} ${mockErr}`);
          done();
        });
    });
  });
});
