// tslint:disable:max-line-length
import { MESSAGE } from "../config";
import { IHTTPResponse, IRequestOptions, RequestAdapter } from "./requestAdapter";

describe("Class: RequestAdapter", () => {
  describe("when creating the RequestAdapter", () => {
    it("should create a valid object", () => {
      expect(new RequestAdapter((uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve()} as IHTTPResponse);
      })).toBeDefined();
    });
  });

  describe("when executing a succesful query", () => {
    const respData = [{id: 1}, {id: 2}, {id: 3}];
    it("should not throw an exception and should return the data", (done) => {
      (new RequestAdapter((uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve(respData)} as IHTTPResponse);
      }))
        .execute("validProjectID", {headers: {}})
        .then((data: any) => {
          expect(data).toEqual(respData);
          done();
        })
        .catch((err: Error) => {
          done.fail(err);
        });
    });

    describe("when calling fetch fails", () => {
      const error = "unauthorized";
      it("should cause fetch error", (done) => {
        (new RequestAdapter((uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
          return Promise.resolve({ok: false, status: 401, statusText: error} as IHTTPResponse);
        }))
          .execute("invalidProjectID", {})
          .then((data: any) => {
            done.fail("should throw an error");
          })
          .catch((err: Error) => {
            expect(err).toEqual(new Error(`${MESSAGE.CORE.BACKEND_ERROR}401 unauthorized`));
            done();
          });
      });
    });

    describe("when executing query with not ok status", () => {
      const error = new Error("error");
      it("should throw an exception", (done) => {
        (new RequestAdapter((uri: string, opts?: IRequestOptions): Promise<IHTTPResponse> => {
          return Promise.reject(error);
        }))
          .execute("validProjectID", {})
          .then((data: any) => {
            done.fail("should throw an error");
          })
          .catch((err: Error) => {
            expect(err).toEqual(error);
            done();
          });
      });
    });
  });
});
