import * as Promise from "bluebird";
import { IHTTPResponse, IRequestOptions, RequestAdapter } from "../src/requestAdapter";

/* mock server successful response */
let respData = [{id: 1}, {id: 2}, {id: 3}];
/* mock server error response */
let errUnauthorized = {errors: ["Unauthorized."]};

let mockFetch = (uri: string, opts: IRequestOptions): Promise<IHTTPResponse> => {
  if (uri === "validURL") {
    if (opts.headers) {
      /* success */
      return Promise.resolve(<IHTTPResponse> {ok: true, status: 200, json: () => Promise.resolve(respData)});
    }
    /* unauthorized (returns "not ok" status) */
    return Promise.resolve(<IHTTPResponse> {ok: false, status: 401, json: () => Promise.resolve(errUnauthorized)});
  }
  /* fetch error */
  return Promise.reject(new Error("Fetch error."));
};

describe("Class: RequestAdapter", () => {
  describe("when creating the RequestAdapter", () => {
    it("should create a valid object", () => {
      expect(new RequestAdapter(mockFetch)).toBeDefined();
    });
  });

  describe("when executing a succesful query", () => {
    it("should not throw an exception and should return the data", (done) => {
      (new RequestAdapter(mockFetch))
        .execute("validURL", {headers: {}})
        .then((data: any) => {
          expect(data).toEqual(respData);
          done();
        })
        .catch((err: Error) => {
          done.fail(err);
        });
    });

    describe("when calling fetch fails", () => {
      it("should cause fetch error", (done) => {
        (new RequestAdapter(mockFetch))
          .execute("invalidURL", {})
          .then((data: any) => {
            done.fail("should throw an error");
          })
          .catch((err: Error) => {
            expect(err).toEqual(new Error("Fetch error."));
            done();
          });
      });
    });

    describe("when executing query with not ok status", () => {
      it("should throw an exception", (done) => {
        (new RequestAdapter(mockFetch))
          .execute("validURL", {})
          .then((data: any) => {
            done.fail("should throw an error");
          })
          .catch((err: Error) => {
            expect(err).toEqual(new Error("Unauthorized."));
            done();
          });
      });
    });
  });
});

