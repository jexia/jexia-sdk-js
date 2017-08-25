// tslint:disable:max-line-length
import { IAuthToken, TokenManager } from "../src/tokenManager";
import { requestAdapterMockFactory } from "./testUtils";
const validURL = "validUrl";

describe("Class: TokenManager", () => {
  describe("when authenticating", () => {
    it("should throw an error if application URL is not provided", (done) => {
      (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({appUrl: "", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw app URL error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia App URL."));
          done();
        });
    });

    it("should throw an error if key or secret is not provided", (done) => {
      (new TokenManager(requestAdapterMockFactory().genericSuccesfulExecution()))
        .init({appUrl: validURL, key: "", secret: ""})
        .then(() => done.fail("should throw credentials error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please provide valid application credentials."));
          done();
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(requestAdapterMockFactory().failedExecution("Auth error.")))
        .init({appUrl: validURL, key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw authentication error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Unable to authenticate: Auth error."));
          done();
        });
    });

    it("should have valid token and refresh token if authorization succeeded", (done) => {
      (new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "validToken", refresh_token: "validRefreshToken"})))
        .init({appUrl: validURL, key: "validKey", secret: "validSecret"})
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
  });

  describe("when refreshing the token", () => {
    it("should send the refresh token request to the correct url", (done) => {
      let mockAdapter = requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"});
      let tokenManager = new TokenManager(mockAdapter);
      tokenManager.init({appUrl: validURL, key: "validKey", secret: "validSecret"}).then( () => {
        spyOn(mockAdapter, "execute").and.callThrough();
        (tokenManager as any).refresh("appUrl").then( () => {
          expect(mockAdapter.execute).toHaveBeenCalledWith("http://appUrl:8080/auth", jasmine.any(Object) );
          done();
        }).catch( (err: Error) => done.fail(`refresh should not have failed: ${err.message}`));
      });
    });

    it("should throw an error on refresh token failure", (done) => {
      (new TokenManager(requestAdapterMockFactory().succesfulExecution({token: "token", refresh_token: "refreshToken"})))
        .init({appUrl: validURL, key: "validKey", secret: "validSecret"})
        .then((tokenManager: TokenManager) => {
          (tokenManager as any).requestAdapter = requestAdapterMockFactory().failedExecution("refresh error.");
          (tokenManager as any).refresh(validURL)
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
        .init({appUrl: validURL, key: "validKey", refreshInterval: 500, secret: "validSecret"})
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
        .init({appUrl: validURL, key: "validKey", refreshInterval: 500, secret: "validSecret"})
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
