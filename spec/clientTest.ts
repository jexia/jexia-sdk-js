import Client from "../src/client";
import { IModule } from "../src/module";
import { IHTTPResponse, IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";
import { mockRequestAdapter } from "./requestAdapterTest";

const errFailedToInitModule = new Error("failed to init module");

const mockModuleFailure: IModule = {
  init: (tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.reject(errFailedToInitModule);
  },
};

const mockModuleSuccess: IModule = {
  init: (tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule> => {
    return Promise.resolve(mockModuleSuccess);
  },
};

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
            done.fail("Refresh Interval on TokenManager is undefined, so login failed; maybe mock logic is broken?");
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
            done.fail("Refresh Interval on TokenManager is undefined, so login failed; maybe mock logic is broken?");
            return;
          }
          expect(err).toEqual(errFailedToInitModule);
          /* check if refresh loop has been stopped and interval is clean */
          expect((client.tokenManager as any).refreshInterval._repeat).toBeNull();
          done();
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
});
