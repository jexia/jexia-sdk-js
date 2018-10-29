// tslint:disable:max-line-length
// tslint:disable:no-string-literal
import { createMockFor, requestAdapterMockFactory } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { ApiKeyAuth } from "../auth/apiKeyAuth";
import { UserCredentialsAuth } from "../auth/userCredentialsAuth";
import { TokenStorage } from "./componentStorage";
import { IAuthAdapter, IAuthToken, TokenManager } from "./tokenManager";

const validProjectID = "validProjectID";
const defaultToken = Object.freeze({ token: "token", refresh_token: "refreshToken" });

const validOpts = () => ({ projectID: validProjectID, key: "validKey", refreshInterval: 500, secret: "validSecret" });

const authMethodMock = (
  resultValue = "authMethodMockToken",
  resultPromise = Promise.resolve(resultValue),
) => {
  const authMethod: IAuthAdapter = createMockFor(["login", "refresh"], { returnValue: resultPromise });
  return {
    authMethod,
    resultValue,
    resultPromise,
  };
};

const tokenManagerWithTokens = () => {
  const requestAdapter = requestAdapterMockFactory().succesfulExecution(defaultToken);
  return new TokenManager(requestAdapter);
};

describe("Class: TokenManager", () => {
  describe("when authenticating", () => {
    let tm: TokenManager;

    beforeEach( () => {
      TokenStorage.cleanStorage();
      tm = new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "validToken", refresh_token: "validRefreshToken"}));
    });

    it("should throw an error if application URL is not provided", async () => {
      await (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({projectID: "", key: "validKey", secret: "validSecret"})
        .then(() => { throw new Error("should have throw app URL error"); })
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia project ID."));
        });
    });

    it("should throw an error if key or secret is not provided", async () => {
      await (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({projectID: validProjectID, key: "", secret: ""})
        .then(() => { throw new Error("should have throw authentication error"); })
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please provide valid application credentials."));
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(requestAdapterMockFactory().failedExecution("Auth error.")))
        .init({projectID: validProjectID, key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw authentication error"))
        .catch((err: Error) => {
          expect(err).toBeDefined();
          done();
        });
    });

    it("should try login when storage has no token", async () => {
      spyOn(TokenStorage.getStorageAPI(), "isEmpty").and.returnValue(true);
      spyOn(tm as any, "login").and.returnValue(Promise.resolve());
      const opts = { ...validOpts(), authMethod: () => authMethodMock().authMethod };
      await tm.init(opts);
      expect(tm["login"]).toHaveBeenLastCalledWith(opts);
    });

    it("should fail initialization when login fails", async () => {
      spyOn(TokenStorage.getStorageAPI(), "isEmpty").and.returnValue(true);
      const loginError = "loginError";
      spyOn(tm as any, "login").and.returnValue(Promise.reject(loginError));
      const opts = { ...validOpts(), authMethod: () => authMethodMock().authMethod };
      try {
        await tm.init(opts);
        throw new Error("init should have failed!");
      } catch (error) {
        expect(error).toBe(loginError);
      }
    });

    it("should try refresh session when storage has no token", async () => {
      spyOn(TokenStorage.getStorageAPI(), "isEmpty").and.returnValue(false);
      spyOn(tm as any, "refresh").and.returnValue(Promise.resolve());
      const opts = { ...validOpts(), authMethod: () => authMethodMock().authMethod };
      await tm.init(opts);
      expect(tm["refresh"]).toHaveBeenLastCalledWith(opts.projectID);
    });

    it("should fail initialization when refresh session fails", async () => {
      spyOn(TokenStorage.getStorageAPI(), "isEmpty").and.returnValue(false);
      const loginError = "loginError";
      spyOn(tm as any, "refresh").and.returnValue(Promise.reject(loginError));
      const opts = { ...validOpts(), authMethod: () => authMethodMock().authMethod };
      try {
        await tm.init(opts);
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
      const tokens = await tm.init(validOpts()).then((out) => out["tokens"]);
      expect(tokens.token).toBe("validToken");
      expect(tokens.refreshToken).toBe("validRefreshToken");
    });

    it("should throw an error if the token is accessed before login", (done) => {
      tm.token.then( () => {
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
      TokenStorage.cleanStorage();
      tm = new TokenManager(requestAdapterMockFactory().succesfulExecution({ token: "validToken", refresh_token: "validRefreshToken" }));
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
        .then(() => tm.token)
        .then(() => done.fail("Token access should have failed"))
        .catch((err: Error) => {
          expect(err.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
          done();
        });
    });

    it("should use api key as a default auth method", (done) => {
      tm.init(validOpts())
        .then((tokenManager: TokenManager) => {
          expect(tokenManager["authMethod"] instanceof ApiKeyAuth).toBeTruthy();
          done();
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should use the given auth method", (done) => {
      tm.init({ ...validOpts(), authMethod: () => new UserCredentialsAuth() })
        .then((tokenManager: TokenManager) => {
          expect(tokenManager["authMethod"] instanceof UserCredentialsAuth).toBeTruthy();
          done();
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should use auth method adapter correctly", (done) => {
      const { authMethod, resultValue } = authMethodMock();
      const opts = { ...validOpts(), authMethod: () => authMethod };
      spyOn(tm["storage"], "setTokens");
      tm.init(opts)
        .then((tokenManager: TokenManager) => {
          expect(authMethod.login).toHaveBeenCalledWith(opts, tokenManager["requestAdapter"]);
          expect(tm["storage"].setTokens).toHaveBeenCalledWith(resultValue);
          done();
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });
  });

  describe("when refreshing the token", () => {
    it("should use the auth method adapter correct", (done) => {
      const { authMethod } = authMethodMock();
      const opts = { ...validOpts(), authMethod: () => authMethod };
      const tm = tokenManagerWithTokens();
      tm.init(opts)
        .then(({ tokens, requestAdapter }) => {
          setTimeout(() => {
            expect(authMethod.refresh).toHaveBeenCalledWith(
              tokens,
              requestAdapter,
              opts.projectID,
            );
            done();
          }, opts.refreshInterval + 10);
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should set the new tokens after a success refresh", (done) => {
      const { authMethod, resultValue } = authMethodMock();
      const opts = { ...validOpts(), authMethod: () => authMethod };
      const tm = tokenManagerWithTokens();
      tm.init(opts)
        .then(({ tokens, requestAdapter }) => {
          spyOn(tm["storage"], "setTokens");
          setTimeout(() => {
            expect(tm["storage"].setTokens).toHaveBeenCalledWith(resultValue);
            done();
          }, opts.refreshInterval + 10);
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should throw an error on refresh token failure", (done) => {
      tokenManagerWithTokens()
        .init(validOpts())
        .then((tokenManager: TokenManager) => {
          tokenManager["requestAdapter"] = requestAdapterMockFactory().failedExecution("refresh error.");
          tokenManager["refresh"](validProjectID)
            .then( () => done.fail("refresh should have failed"))
            .catch( (err: Error) => {
              expect(err.message).toEqual("Unable to refresh token: refresh error.");
              done();
            });
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should have updated token after successful auto refresh", (done) => {
      const { authMethod, resultValue } = authMethodMock();
      const opts = validOpts();
      tokenManagerWithTokens()
        .init({ ...opts, authMethod: () => authMethod })
        .then((tokenManager: TokenManager) => {
          spyOn(tokenManager["storage"], "setTokens");
          tokenManager["requestAdapter"] = requestAdapterMockFactory().succesfulExecution({token: "updatedToken", refresh_token: "updatedRefreshToken"});
          setTimeout(() => {
            expect(tokenManager["storage"].setTokens).toHaveBeenLastCalledWith(resultValue);
            done();
          }, opts.refreshInterval + 10);
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should have updated refresh token after successful auto refresh", (done) => {
      tokenManagerWithTokens()
        .init(validOpts())
        .then((tokenManager: TokenManager) => {
          tokenManager["requestAdapter"] = requestAdapterMockFactory().succesfulExecution({token: "updatedToken", refresh_token: "updatedRefreshToken"});
          setTimeout(() => {
            tokenManager["tokens"]
              .then((tokens: IAuthToken) => {
                expect(tokens.refreshToken).toBe("updatedRefreshToken");
                done();
              })
              .catch((err: Error) => done.fail(`refresh should not have failed: ${err.message}`));
          }, 700);
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });
  });
});
