import { TokenManager } from "../src/tokenManager";
import { createFetchMockForFailedAuthRequest, createFetchMockForSuccesfulAuthRequest } from "./testUtils";

describe("TokenManager class", () => {
  describe("when creating the manager", () => {
    it("should succesfully create a new TokenManager", () => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      expect(tm instanceof TokenManager).toBe(true);
    });
  });

  describe("when authenticating", () => {
    it("should store the token on succesful authentication", (done) => {
      let token: string = "token";
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      tm.authenticate("key", "secret").then( (tokenManager: TokenManager) => {
        expect(tokenManager.Token).toBe(token);
        done();
      }).catch( (error: Error) => {
        done.fail(error.message);
      });
    });

    it ("should not hide errors on unsuccesful authentication", (done) => {
      let credentialsError: string = "ERROR: invalid user or password (SQLSTATE 28P01)";
      let fetch: Function = createFetchMockForFailedAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      tm.authenticate("key", "secret").then( () => {
        done.fail("Call should have failed");
      }).catch( (error: Error) => {
        expect(error.message).toBe(credentialsError);
        done();
      });
    });
  });

  describe("when building Authorization headers with getAuthorizationHeader()", () => {
    it("should throw an error if authentication wasn't succesful", (done) => {
      let fetch: Function = createFetchMockForFailedAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      tm.authenticate("key", "secret").then( () => {
        done.fail("Call should have failed");
      }).catch( (error: Error) => {
        expect(() => tm.getAuthorizationHeader())
        .toThrow(new Error("TokenManager does not contain a valid token. Forgot to authenticate?"));
        done();
      });
    });

    it("should throw an error if authentication wasn't executed yet", () => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      let tm = new TokenManager("url", fetch);
      expect(() => tm.getAuthorizationHeader())
      .toThrow(new Error("TokenManager does not contain a valid token. Forgot to authenticate?"));
    });

    it("should return an object literal that contains an authorization property", (done) => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      tm.authenticate("key", "secret").then( (tokenManager: TokenManager) => {
        expect(tm.getAuthorizationHeader().authorization).toBeDefined();
        done();
      });
    });

    it("should return the proper authorization header", (done) => {
      const token: string = "token";
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      let tm: TokenManager = new TokenManager("url", fetch);
      tm.authenticate("key", "secret").then( (tokenManager: TokenManager) => {
        expect(tm.getAuthorizationHeader()).toEqual({ authorization: token });
        done();
      });
    });
  });
});
