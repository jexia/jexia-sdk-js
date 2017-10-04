import Client from "../src/api/core/client";
import { IModule } from "../src/api/core/module";
import { TokenManager } from "../src/api/core/tokenManager";
import { IHTTPResponse, IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";
import { mockRequestAdapter } from "./requestAdapterTest";
import { requestAdapterMockFactory } from "./testUtils";

const errFailedToInitModule = new Error("failed to init module");

const mockModuleFailure: IModule = {
  init: (appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.reject(errFailedToInitModule);
  },
  terminate: () => {
    return Promise.resolve();
  }
};

const mockModuleSuccess: IModule = {
  init: (appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.resolve(mockModuleSuccess);
  },
  terminate: () => {
    return Promise.resolve();
  }
};

const moduleVoidTerminating: IModule = {
  init: (appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.resolve(moduleVoidTerminating);
  },
  terminate: () => {
    return Promise.resolve();
  }
}

const moduleVoidTerminatingError: IModule = {
  init: (appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.resolve(moduleVoidTerminatingError);
  },
  terminate: () => {
    let errorPromise = new Promise((resolve, error) => {
      setTimeout(() => {
        error('some error');
      }, 1);
    });
    return errorPromise;
  }
}

describe("Class: Client", () => {
  describe("on init", () => {
    it("should fail when passed a single module that failed to init", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, mockModuleFailure)
        .then((cli: Client) => done.fail("init should have failed"))
        .catch((err: Error) => {
          if (!(client.tokenManager as any).refreshInterval) {
            done.fail(`Refresh Interval on TokenManager is undefined, so login failed; maybe mock logic is broken?
              ${err}`);
            return;
          }
          expect(err).toEqual(errFailedToInitModule);
          /* check if refresh loop has been stopped and interval is clean */
          expect((client.tokenManager as any).refreshInterval._repeat).toBeNull();
          done();
        });
    });

    it("should not fail when passed a single module that was loaded successfully", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, mockModuleSuccess)
        .then((cli: Client) => done())
        .catch((err: Error) => done.fail("init should not have failed"));
    });

    it("should fail if passed multiple modules and at least one fails to init", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init(
          {appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"},
          mockModuleSuccess,
          mockModuleSuccess,
          mockModuleFailure,
        )
        .then((cli: Client) => done.fail("init should have failed"))
        .catch((err: Error) => {
          if (!(client.tokenManager as any).refreshInterval) {
            done.fail(`Refresh Interval on TokenManager is undefined, so login failed; maybe mock logic is broken?
              ${err}`);
            return;
          }
          expect(err).toEqual(errFailedToInitModule);
          /* check if refresh loop has been stopped and interval is clean */
          expect((client.tokenManager as any).refreshInterval._repeat).toBeNull();
          done();
        });
    });

    it("should pass the correct parameters to the modules", (done) => {
      spyOn(mockModuleSuccess, "init");
      let adapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
      let tokenManagerMock = new TokenManager(adapterMock);
      let validUrl = "validUrl";
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      (client as any).tokenManager = tokenManagerMock;
      (client as any).requestAdapter = adapterMock;
      client.init({appUrl: validUrl, key: "validKey", secret: "validSecret"}, mockModuleSuccess).then( () => {
        expect(mockModuleSuccess.init).toHaveBeenCalledWith(validUrl, tokenManagerMock, adapterMock);
        done();
      }).catch( (err) => {
        done.fail(`init should not have failed: ${err.message}`);
      });
    });

    it("should not fail if passed multiple modules and all are loaded successfully", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init(
          {appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"},
          mockModuleSuccess,
          mockModuleSuccess,
          mockModuleSuccess,
        )
        .then((cli: Client) => done())
        .catch((err: Error) => done.fail("init should not have failed"));
    });
  });

  describe('on terminate', () => {
    it("should not fail when terminates all modules", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, mockModuleSuccess)
        .then((cli: Client) => {
          cli
            .terminate()
            .then(() => {
              done();
            })
            .catch((err: Error) => done.fail("finalize shoud not have failed"));
        })
        .catch((err: Error) => done.fail("init should not have failed"));
    });

    it("should fail when terminates", (done) => {
      let client = new Client((uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      });
      /* replace request adapter with mock */
      client.tokenManager = new TokenManager(mockRequestAdapter);

      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, moduleVoidTerminatingError)
        .then((cli: Client) => {
          cli
            .terminate()
            .then(() => {
              done.fail('init should not have done it well');
            })
            .catch((err: Error) => done());
        })
        .catch((err: Error) => done.fail("init should not have failed at initing"));
    });
  });
});
