// tslint:disable:max-line-length
// tslint:disable:no-string-literal
import { createMockFor, requestAdapterMockFactory } from "../../../spec/testUtils";
import { MESSAGE } from "../../config/message";
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

    it("should throw an error if application URL is not provided", (done) => {
      (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({projectID: "", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw app URL error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia project ID."));
          done();
        });
    });

    it("should throw an error if key or secret is not provided", (done) => {
      (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({projectID: validProjectID, key: "", secret: ""})
        .then(() => done.fail("should throw credentials error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please provide valid application credentials."));
          done();
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(requestAdapterMockFactory().failedExecution("Auth error.")))
        .init({projectID: validProjectID, key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw authentication error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Unable to authenticate: Auth error."));
          done();
        });
    });

    it("should have valid token and refresh token if authorization succeeded", (done) => {
      tm.init({projectID: validProjectID, key: "validKey", secret: "validSecret"})
        .then((output: TokenManager) => {
          expect(output instanceof TokenManager).toBe(true);
          return output["tokens"];
        })
        .then((tokens: IAuthToken) => {
          expect(tokens.token).toBe("validToken");
          expect(tokens.refreshToken).toBe("validRefreshToken");
          done();
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
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
      const { authMethod, resultValue } = authMethodMock();
      const opts = { ...validOpts(), authMethod: () => authMethod };
      const tm = tokenManagerWithTokens();
      spyOn(tm["storage"], "setTokens");
      tm.init(opts)
        .then((tokenManager) => {
          const tokens = tokenManager["tokens"];
          setTimeout(() => {
            expect(authMethod.refresh).toHaveBeenCalledWith(
              tokens,
              tokenManager["requestAdapter"],
              opts.projectID,
            );
            expect(tm["storage"].setTokens).toHaveBeenCalledWith(resultValue);
            done();
          }, opts.refreshInterval + 10);
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should throw an error on refresh token failure", (done) => {
      tokenManagerWithTokens()
        .init({projectID: validProjectID, key: "validKey", secret: "validSecret"})
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
      tokenManagerWithTokens()
        .init(validOpts())
        .then((tokenManager: TokenManager) => {
          tokenManager["requestAdapter"] = requestAdapterMockFactory().succesfulExecution({token: "updatedToken", refresh_token: "updatedRefreshToken"});
          setTimeout(() => {
            tokenManager.token
              .then((token: string) => {
                expect(token).toBe("updatedToken");
                done();
              })
              .catch((err: Error) => done.fail(`refresh should not have failed: ${err.message}`));
          }, 700);
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
