// tslint:disable:max-line-length
// tslint:disable:no-string-literal
import { requestAdapterMockFactory } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { Methods } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { TokenStorage } from "./componentStorage";
import { TokenManager } from "./tokenManager";

const validProjectID = "validProjectID";
const defaultToken = Object.freeze({ access_token: "accessToken", refresh_token: "refreshToken" });

const validOpts = () => ({ projectID: validProjectID, key: "validKey", refreshInterval: 500, secret: "validSecret" });

const tokenManagerWithTokens = () => {
  const requestAdapter = requestAdapterMockFactory().succesfulExecution(defaultToken);
  return new TokenManager(requestAdapter, new Logger());
};

describe("Class: TokenManager", () => {
  describe("when authenticating", () => {
    let tm: TokenManager;

    beforeEach(() => {
      TokenStorage.getStorageAPI().clear();
      tm = tokenManagerWithTokens();
    });

    it("should throw an error if application URL is not provided", async () => {
      tm
        .init({projectID: "", key: "validKey", secret: "validSecret"})
        .then(() => { throw new Error("should have throw app URL error"); })
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia project ID."));
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(
        requestAdapterMockFactory().failedExecution("Auth error."),
        new Logger()
       ))
        .init({projectID: validProjectID, key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw authentication error"))
        .catch((err: Error) => {
          expect(err).toBeDefined();
          done();
        });
    });

    it("should fail initialization when login fails", async () => {
      spyOn(TokenStorage.getStorageAPI(), "isEmpty").and.returnValue(true);
      const loginError = "loginError";
      spyOn(tm as any, "login").and.returnValue(Promise.reject(loginError));
      try {
        await tm.init(validOpts());
        throw new Error("init should have failed!");
      } catch (error) {
        expect(error).toBe(loginError);
      }
    });

    it("should result itself at then promise when authorization succeeded", async () => {
      const result = await tm.init(validOpts());
      expect(result).toBe(tm);
    });

    it("should have valid token and refresh token if authorization succeeded", async () => {
      const token = await tm.init(validOpts()).then((out: TokenManager) => out.token());
      expect(token).toBe(defaultToken.access_token);
    });

    it("should throw an error if the token is accessed before login", (done) => {
      tm.token().then( () => {
        done.fail("Token promise should reject.");
      }).catch( (err: Error) => {
        expect(err.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
        done();
      });
    });
  });

  describe("when the client is terminated", () => {
    let tm: TokenManager;

    beforeEach(() => {
      TokenStorage.getStorageAPI().clear();
      tm = new TokenManager(
        requestAdapterMockFactory().succesfulExecution({ token: "validToken", refresh_token: "validRefreshToken" }),
        new Logger()
      );
    });

    it("should have clear the session storage", (done) => {
      spyOn(tm["storage"], "clear");
      tm.init({ projectID: validProjectID, key: "validKey", secret: "validSecret" })
        .then(() => tm.terminate())
        .then(() => expect(tm["storage"]["clear"]).toHaveBeenCalledWith())
        .then(done, done.fail);
    });

    it("should have clear the refresh process interval", (done) => {
      spyOn(global, "clearInterval");
      tm.init({ projectID: validProjectID, key: "validKey", secret: "validSecret" })
        .then(() => tm.terminate())
        .then(() => expect(global.clearInterval).toHaveBeenCalledWith(tm["refreshInterval"]))
        .then(done, done.fail);
    });

    it("should throw an error if the token is accessed after terminate", (done) => {
      tm.init({ projectID: validProjectID, key: "validKey", secret: "validSecret" })
        .then(() => tm.terminate())
        .then(() => tm.token())
        .then(() => done.fail("Token access should have failed"))
        .catch((err: Error) => {
          expect(err.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
          done();
        });
    });
  });

  describe("when refreshing the token", () => {
    let tm: TokenManager;

    beforeEach(() => {
      TokenStorage.getStorageAPI().clear();
      tm = new TokenManager(
        requestAdapterMockFactory().succesfulExecution({ token: "validToken", refresh_token: "validRefreshToken" }),
        new Logger()
      );
    });

    it("should take refresh token from storage and use it to make a request", () => {
      tm["storage"].setTokens("testRefresh", { access_token: "access_token", refresh_token: "refresh_token" });
      tm["refresh"]("testRefresh");
      expect((tm as any).requestAdapter.execute.mock.calls[0][1]).toEqual({
        body: { refresh_token: "refresh_token" },
        method: Methods.POST
      });
    });

    it("should reject promise if there is no token for specific auth", (done) => {
      tm["storage"].setTokens("testRefresh", { access_token: "access_token", refresh_token: "refresh_token" });
      tm["refresh"]("randomAuth")
        .then(() => done.fail("should reject promise with error"))
        .catch((error) => {
          expect(error).toEqual(`There is no refresh token for randomAuth`);
          done();
        });
    });

    it("should throw an error if request failed", (done) => {
      const tokenManager = new TokenManager(
        requestAdapterMockFactory().failedExecution("refresh error"),
        new Logger()
      );
      tokenManager["storage"].setTokens("testRefresh", { access_token: "access_token", refresh_token: "refresh_token" });
      tokenManager["refresh"]("testRefresh")
        .then(() => done.fail("should fail with refresh token error"))
        .catch((error) => {
          expect(error).toEqual(new Error("Unable to refresh token: refresh error"));
          done();
        });
    });

  });

});
