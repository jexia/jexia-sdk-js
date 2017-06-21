import { IAuthToken, TokenManager } from "../src/tokenManager";
import { mockRequestAdapter } from "./requestAdapterTest";

describe("Class: TokenManager", () => {
  describe("when authenticating", () => {
    it("should throw an error if application URL is not provided", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw app URL error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia App URL."));
          done();
        });
    });

    it("should throw an error if key or secret is not provided", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "", secret: ""})
        .then(() => done.fail("should throw credentials error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Please provide valid application credentials."));
          done();
        });
    });

    it("should throw a server error if application URL is invalid", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "invalidUrl", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw not found error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Unable to authenticate: Not found."));
          done();
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw not found error"))
        .catch((err: Error) => {
          expect(err).toEqual(new Error("Unable to authenticate: Auth error."));
          done();
        });
    });

    it("should have valid token and refresh token if authorization succeeded", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", secret: "validSecret"})
        .then((output: TokenManager) => {
          expect(output instanceof TokenManager).toBe(true);
          return (output as any).tokens;
        })
        .then((tokens: IAuthToken) => {
          expect(tokens.token).toBe("validToken");
          expect(tokens.refreshToken).toBe("validRefreshToken");
          done();
        })
        .catch((err: Error) => done.fail("should not have failed"));
    });

    it("should throw an error on refresh token failure", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((output: TokenManager) => {
          (output as any).tokens = Promise.resolve({token: "validToken", refreshToken: "invalidRefreshToken"});
          setTimeout(() => {
            (output as any).tokens
              .then(() => done.fail("refresh should have failed"))
              .catch(() => done());
          }, 700);
        })
        .catch(() => done.fail("init should not have failed"));
    });

    it("should have updated token after successful auto refresh", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((output: TokenManager) => {
          setTimeout(() => {
            output.token
              .then((token: string) => {
                expect(token).toBe("updatedToken");
                done();
              })
              .catch(() => done.fail("refresh should not have failed"));
          }, 700);
        })
        .catch(() => done.fail("init should not have failed"));
    });

    it("should have updated refresh token after successful auto refresh", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((output: TokenManager) => {
          setTimeout(() => {
            (output as any).tokens
              .then((tokens: IAuthToken) => {
                expect(tokens.refreshToken).toBe("updatedRefreshToken");
                done();
              })
              .catch(() => done.fail("refresh should not have failed"));
          }, 700);
        })
        .catch(() => done.fail("init should not have failed"));
    });
  });
});
