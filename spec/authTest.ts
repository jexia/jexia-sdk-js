import * as Promise from "bluebird";
import fetch, {Response} from "node-fetch";
import { getAuthenticationRequestPromise, IAuthOptions } from "../src/auth";

describe("getAuthenticationRequestPromise function", () => {
  describe("succesful request suite", () => {
    let fetchResponseMock;
    let tokenResponseMock;
    let authOptionsMock: IAuthOptions;
    let fetchSpy: jasmine.Spy;

    beforeEach(() => {
      fetchResponseMock = { refresh_token: "refresh_token", token: "token" };
      tokenResponseMock = { refreshToken: "refresh_token", token: "token" };

      authOptionsMock = {appUrl: "url", key: "key", secret: "secret"};
      let returnVal = new Promise<Response>( (resolve, reject) => {
        resolve(new Response(JSON.stringify(fetchResponseMock), {status: 200, statusText: "OK"}));
      });
      fetchSpy = jasmine.createSpy("fetch", fetch).and.returnValue(returnVal);
    });

    it("returns a Promise", () => {
      let result = getAuthenticationRequestPromise(fetchSpy, authOptionsMock);
      expect(result instanceof Promise).toBe(true);
    });

    it("returns a Promise with the tokens", (done) => {
        // create a mock for the fetch function that we pass to the FuT
        getAuthenticationRequestPromise(fetchSpy, authOptionsMock).then( (tokens) => {
          expect(tokens).toEqual(tokenResponseMock);
          done();
        }).catch( (error) => {
          done.fail(error);
        });
    });
  });

  describe("negative testing suite", () => {
    let fetchSpy: jasmine.Spy;
    let authOptionsMock: IAuthOptions;
    let callWentThroughError = "Fetch call should not have been made.";
    let returnVal: Promise<Response>;

    beforeAll(() => {
      returnVal = new Promise<Response>( (resolve, reject) => {
        reject(new Error(callWentThroughError));
      });
      fetchSpy = jasmine.createSpy("fetch", fetch).and.returnValue(returnVal);
    });

    afterAll( () => {
      returnVal.catch( () => {
        // just swallow the Promise error so we don't see Unhandled Rejections when running tests succesfully.
      });
      fetchSpy = null;
    });

    it("checks whether the appUrl is valid", (done) => {
      authOptionsMock = {appUrl: "", key: "key", secret: "secret"};
      getAuthenticationRequestPromise(fetchSpy, authOptionsMock).then( () => {
        done.fail(new Error("Call should have failed"));
      }).catch( (error) => {
        if (error.message === callWentThroughError) {
          done.fail(error);
          return;
        }
        expect(error.message).toBe("Please supply a valid Jexia App URL.");
        done();
      });
    });

    it("checks whether the key is provided", (done) => {
      authOptionsMock = {appUrl: "url", key: "", secret: "secret"};
      getAuthenticationRequestPromise(fetchSpy, authOptionsMock).then( () => {
        done.fail(new Error("Call should have failed"));
      }).catch( (error) => {
        if (error.message === callWentThroughError) {
          done.fail(error);
          return;
        }
        expect(error.message).toBe("Plase provide valid application credentials.");
        done();
      });
    });

    it("checks whether the key is provided", (done) => {
      authOptionsMock = {appUrl: "url", key: "key", secret: ""};
      getAuthenticationRequestPromise(fetchSpy, authOptionsMock).then( () => {
        done.fail(new Error("Call should have failed"));
      }).catch( (error) => {
        if (error.message === callWentThroughError) {
          done.fail(error);
          return;
        }
        expect(error.message).toBe("Plase provide valid application credentials.");
        done();
      });
    });
  });

  describe("when receiving an error from the server", () => {
    let fetchResponseMock;
    let tokenResponseMock;
    let authOptionsMock: IAuthOptions;
    let fetchSpy: jasmine.Spy;

    it("returns the error received", (done) => {
      const credentialsInvalidError = "ERROR: invalid user or password (SQLSTATE 28P01)";
      fetchResponseMock = { errors: [credentialsInvalidError] };
      authOptionsMock = {appUrl: "url", key: "key", secret: "secret"};
      let returnVal = new Promise<Response>( (resolve, reject) => {
        resolve(new Response(JSON.stringify(fetchResponseMock), {status: 400, statusText: "ERROR"}));
      });
      fetchSpy = jasmine.createSpy("fetch", fetch).and.returnValue(returnVal);

      getAuthenticationRequestPromise(fetchSpy, authOptionsMock).then( () => {
        done.fail(new Error("Call should have failed."));
      }).catch( (error) => {
        expect(error.message).toBe(credentialsInvalidError);
        done();
      });
    });
  });
});
