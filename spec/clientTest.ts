import Client from "../src/client";
import { IModule } from "../src/module";
import { IRequestAdapter } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";
import {mockFetch, mockRequestAdapter} from "./requestAdapterTest";

/* required for successful client initialization */
(global as any).fetch = mockFetch;

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
    it("should fail if one of the modules failed to init", (done) => {
      let client = new Client();
      /* replace request adapter with mock */
      client.requestAdapter = mockRequestAdapter;
      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, mockModuleFailure)
        .then((cli: Client) => done.fail("init should have failed"))
        .catch((err: Error) => {
          expect(err).toEqual(errFailedToInitModule);
          /* check if refresh loop has been stopped and interval is clean */
          expect((client.tokenManager as any).refreshInterval._repeat).toBeNull();
          done();
        });
    });

    it("should not fail if all of the modules were loaded successfully", (done) => {
      let client = new Client();
      /* replace request adapter with mock */
      client.requestAdapter = mockRequestAdapter;
      client
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"}, mockModuleSuccess)
        .then((cli: Client) => done())
        .catch((err: Error) => done.fail("init should have failed"));
    });
  });
});
