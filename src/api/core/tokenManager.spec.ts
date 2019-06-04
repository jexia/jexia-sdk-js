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
      try {
        await tm.init({ projectID: "", key: "validKey", secret: "validSecret" });
        throw new Error("should have throw app URL error");
      } catch (error) {
        expect(error).toEqual(new Error("Please supply a valid Jexia project ID."));
      }
    });

    it("should throw an error if authentication failed", async () => {
      try {
        await (new TokenManager(
          requestAdapterMockFactory().failedExecution("Auth error."),
          new Logger()
        )).init({ projectID: "", key: "validKey", secret: "validSecret" });
      } catch (error) {
        expect(error).toBeDefined();
      }
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
      try {
        const result = await tm.init(validOpts());
        expect(result).toBe(tm);
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should have valid token and refresh token if authorization succeeded", async () => {
      try {
        const tokenManager: TokenManager = await tm.init(validOpts());
        const token: string = await tokenManager.token();
        expect(token).toBe(defaultToken.access_token);
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should throw an error if the token is accessed before login", async () => {
      try {
        await tm.token();
        throw new Error("token() should have failed!");
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
      }
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

    it("should have clear the session storage", async () => {
      spyOn(tm["storage"], "clear");
      try {
        await tm.init({ projectID: validProjectID, key: "validKey", secret: "validSecret" });
        await tm.terminate();

        expect(tm["storage"]["clear"]).toHaveBeenCalledWith();
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should throw an error if the token is accessed after terminate", async () => {
      try {
        await tm.init({ projectID: validProjectID, key: "validKey", secret: "validSecret" });
        tm.terminate();
        await tm.token();

        expect(global.clearInterval).toHaveBeenCalledWith(tm["refreshInterval"]);
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
      }
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

    it("should reject promise if there is no token for specific auth", async () => {
      tm["storage"].setTokens("testRefresh", { access_token: "access_token", refresh_token: "refresh_token" });
      try {
        await tm["refresh"]("randomAuth");
      } catch (error) {
        expect(error).toEqual("There is no refresh token for randomAuth");
      }
    });

    it("should throw an error if request failed", async () => {
      const tokenManager = new TokenManager(
        requestAdapterMockFactory().failedExecution("refresh error"),
        new Logger()
      );
      tokenManager["storage"].setTokens("testRefresh", { access_token: "access_token", refresh_token: "refresh_token" });
      try {
        await tokenManager["refresh"]("testRefresh");
      } catch (error) {
        expect(error).toEqual(new Error("Unable to refresh token: refresh error"));
      }
    });

  });

});
