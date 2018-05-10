// tslint:disable:no-string-literal
import { ReflectiveInjector } from "injection-js";
import { Client, ClientInit } from "../src/api/core/client";
import { IModule } from "../src/api/core/module";
import { AuthOptions, TokenManager } from "../src/api/core/tokenManager";
import { IHTTPResponse, IRequestOptions, RequestAdapter } from "../src/internal/requestAdapter";
import { deferPromise } from "../src/internal/utils";
import { mockPrototypeOf } from "./testUtils";

const errFailedToInitModule = new Error("failed to init module");

const validClientOpts = Object.freeze({
  key: "validKey",
  projectID: "validProjectID",
  refreshInterval: 500,
  secret: "validSecret",
});

const fetchWithRequestMockOk = (uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
  return Promise.resolve({
    json: () => Promise.resolve({ token: "token", refresh_token: "refresh_token" }), ok: true, status: 200,
  } as IHTTPResponse);
};

const mockModuleFailure: IModule = {
  init: (injector: ReflectiveInjector) => Promise.reject(errFailedToInitModule),
  terminate: () => Promise.resolve({} as any),
};

const mockModuleSuccess: IModule = {
  init: (injector: ReflectiveInjector) => Promise.resolve(mockModuleSuccess),
  terminate: () => Promise.resolve({} as any),
};

const moduleVoidTerminating: IModule = {
  init: (injector: ReflectiveInjector) => Promise.resolve(moduleVoidTerminating),
  terminate: () => Promise.resolve({} as any),
};

const moduleVoidTerminatingError: IModule = {
  init: (injector: ReflectiveInjector) => Promise.resolve(moduleVoidTerminatingError),
  terminate: () => new Promise<any>((resolve, reject) => {
    setTimeout(() => reject("some error"), 1);
  }),
};

describe("Class: Client", () => {

  beforeEach(() => {
    mockPrototypeOf(TokenManager);
    (TokenManager.prototype.init as jasmine.Spy).and.callFake(function (this: any) { return Promise.resolve(this); });
  });

  describe("on init", () => {
    it("should fail when passed a single module that failed to init", (done) => {
      const client = new Client(fetchWithRequestMockOk);
      client
        .init(validClientOpts, mockModuleFailure)
        .then((cli: Client) => done.fail("init should have failed"))
        .catch((err: Error) => {
          expect(err).toEqual(errFailedToInitModule);
          expect(client["tokenManager"].terminate).toHaveBeenCalledWith();
          done();
        });
    });

    it("should not fail when passed a single module that was loaded successfully", async () => {
      await (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
    });

    it("should inject into the modules the system initialization promise that wait for all the modules", (done) => {
      const defer  = deferPromise();
      let injector: ReflectiveInjector | undefined;
      spyOn(mockModuleSuccess, "init").and.callFake((i: ReflectiveInjector) => {
        injector = i;
        return defer.promise;
      });
      (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
      setTimeout(() => {
        const mainInit = injector!.get(ClientInit);
        const initFinish = jasmine.createSpy("initFinish");
        mainInit.then(initFinish);
        expect(initFinish).not.toHaveBeenCalled();
        defer.resolve();
        setTimeout(() => {
          expect(initFinish).toHaveBeenCalled();
          done();
        });
      });
    });

    it("should inject into the modules the auth options", async () => {
      let injector: ReflectiveInjector | undefined;
      spyOn(mockModuleSuccess, "init").and.callFake((i: ReflectiveInjector) => {
        injector = i;
        return Promise.resolve();
      });
      await (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
      const authOptions = injector!.get(AuthOptions);
      expect(authOptions).toBe(validClientOpts);
    });

    it("should inject into the modules the request adapter with the given fetch function", async () => {
      let injector: ReflectiveInjector | undefined;
      spyOn(mockModuleSuccess, "init").and.callFake((i: ReflectiveInjector) => {
        injector = i;
        return Promise.resolve();
      });
      await (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
      const requestAdapter = injector!.get(RequestAdapter);
      expect(requestAdapter instanceof RequestAdapter).toBeTruthy();
      expect(requestAdapter["fetch"]).toBe(fetchWithRequestMockOk);
    });

    it("should inject into the modules the token manager", async () => {
      let injector: ReflectiveInjector | undefined;
      spyOn(mockModuleSuccess, "init").and.callFake((i: ReflectiveInjector) => {
        injector = i;
        return Promise.resolve();
      });
      await (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
      const tokenManager = injector!.get(TokenManager);
      expect(tokenManager instanceof TokenManager).toBeTruthy();
    });

    it("should fail if passed multiple modules and at least one fails to init", (done) => {
      const client = new Client(fetchWithRequestMockOk);
      client
        .init(
          validClientOpts,
          mockModuleSuccess,
          mockModuleSuccess,
          mockModuleFailure,
        )
        .then((cli: Client) => done.fail("init should have failed"))
        .catch((err: Error) => {
          expect(err).toEqual(errFailedToInitModule);
          expect(client["tokenManager"].terminate).toHaveBeenCalledWith();
          done();
        });
    });

    it("should init the modules synchronous passing the correct parameters", () => {
      spyOn(mockModuleSuccess, "init");
      const client = new Client(fetchWithRequestMockOk);
      client.init({ projectID: "validProjectID", key: "validKey", secret: "validSecret"}, mockModuleSuccess);
      expect(mockModuleSuccess.init).toHaveBeenCalled();
    });

    it("should not fail if passed multiple modules and all are loaded successfully", async () => {
      await (new Client(fetchWithRequestMockOk)).init(
        validClientOpts,
        mockModuleSuccess,
        mockModuleSuccess,
        mockModuleSuccess,
      );
    });
  });

  describe("on terminate", () => {
    it("should not fail when terminates all modules", async () => {
      const cli = await (new Client(fetchWithRequestMockOk)).init(validClientOpts, mockModuleSuccess);
      await cli.terminate();
    });

    it("should fail when any module fails to terminate", async () => {
      await (new Client(fetchWithRequestMockOk))
        .init(validClientOpts, moduleVoidTerminatingError)
        .then((cli: Client) => cli
          .terminate()
          .then(() => { throw new Error("init should not have done it well"); })
          .catch(() => {/* */}),
        );
    });
  });
});
