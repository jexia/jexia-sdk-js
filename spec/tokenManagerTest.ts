// tslint:disable:max-line-length
import { API } from "../src/config/config";
import { IAuthToken, TokenManager } from "../src/api/core/tokenManager";
import { MESSAGE } from "../src/config/message";
import { requestAdapterMockFactory } from "./testUtils";
import { TokenStorage } from "../src/api/core/componentStorage";

const validProjectID = "validProjectID";

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
          return (output as any).tokens;
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

    it("should throw an error if the token is accessed after terminate", (done) => {
      tm.init({projectID: validProjectID, key: "validKey", secret: "validSecret"})
      .then(() => tm.terminate())
      .then(() => tm.token)
      .then( () => done.fail("Token access should have failed"))
      .catch((err: Error) => {
        expect(err.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
        done();
      });
    });
  });

  describe("when refreshing the token", () => {
    it("should send the refresh token request to the correct url", (done) => {
      let mockAdapter = requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"});
      let tokenManager = new TokenManager(mockAdapter);
      tokenManager.init({projectID: validProjectID, key: "validKey", secret: "validSecret"}).then( () => {
        spyOn(mockAdapter, "execute").and.callThrough();
        (tokenManager as any).refresh("projectID").then( () => {
          expect(mockAdapter.execute).toHaveBeenCalledWith(`${API.PROTOCOL}://projectID.${API.HOST}.${API.DOMAIN}:${API.PORT}/auth`, jasmine.any(Object) );
          done();
        }).catch( (err: Error) => done.fail(`refresh should not have failed: ${err.message}`));
      });
    });

    it("should throw an error on refresh token failure", (done) => {
      (new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"})))
        .init({projectID: validProjectID, key: "validKey", secret: "validSecret"})
        .then((tokenManager: TokenManager) => {
          (tokenManager as any).requestAdapter = requestAdapterMockFactory().failedExecution("refresh error.");
          (tokenManager as any).refresh(validProjectID)
            .then( () => done.fail("refresh should have failed"))
            .catch( (err: Error) => {
              expect(err.message).toEqual("Unable to refresh token: refresh error.");
              done();
            });
        })
        .catch((err: Error) => done.fail(`init should not have failed: ${err.message}`));
    });

    it("should have updated token after successful auto refresh", (done) => {
      (new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"})))
        .init({projectID: validProjectID, key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((tokenManager: TokenManager) => {
          (tokenManager as any).requestAdapter = requestAdapterMockFactory().succesfulExecution({token: "updatedToken", refresh_token: "updatedRefreshToken"});
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
      (new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"})))
        .init({projectID: validProjectID, key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((tokenManager: TokenManager) => {
          (tokenManager as any).requestAdapter = requestAdapterMockFactory().succesfulExecution({token: "updatedToken", refresh_token: "updatedRefreshToken"});
          setTimeout(() => {
            (tokenManager as any).tokens
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
