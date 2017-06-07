import { IRequestAdapter, IRequestOptions, Methods } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

/* Mock request adapter */
const mockRequestAdapter: IRequestAdapter = {
  execute: (uri: string, opt: IRequestOptions): Promise<any> => {
    /* check URL validity */
    if (uri === "validUrl/auth") {
      switch (opt.method) {
      /* log in */
      case Methods.POST:
        if ((opt.body as any).email === "validKey" && (opt.body as any).password === "validSecret") {
          return Promise.resolve({token: "validToken", refresh_token: "validRefreshToken"});
        }
        return Promise.reject(new Error("Auth error."));
      /* refresh token */
      case Methods.PATCH:
        if ((opt.headers as any).Authorization === "validToken"
          && (opt.body as any).refresh_token === "validRefreshToken") {
          return Promise.resolve({token: "updatedToken", refresh_token: "updatedRefreshToken"});
        }
        return Promise.reject(new Error("Auth error."));
      /* do not allow to use other methods */
      default:
        /* not implemented */
        return Promise.reject(new Error("Not implemented."));
      }
    }
    /* not found error */
    return Promise.reject(new Error("Not found."));
  },
};

describe("Class: TokenManager", () => {
  describe("when authenticating", () => {
    it("should throw an error if application URL is not provided", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw app URL error"))
        .catch((err) => {
          expect(err).toEqual(new Error("Please supply a valid Jexia App URL."));
          done();
        });
    });

    it("should throw an error if key or secret is not provided", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "", secret: ""})
        .then(() => done.fail("should throw credentials error"))
        .catch((err) => {
          expect(err).toEqual(new Error("Please provide valid application credentials."));
          done();
        });
    });

    it("should throw a server error if application URL is invalid", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "invalidUrl", key: "validKey", secret: "validSecret"})
        .then(() => done.fail("should throw not found error"))
        .catch((err) => {
          expect(err).toEqual(new Error("Unable to authenticate: Not found."));
          done();
        });
    });

    it("should throw an error if authentication failed", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "invalidKey", secret: "invalidSecret"})
        .then(() => done.fail("should throw not found error"))
        .catch((err) => {
          expect(err).toEqual(new Error("Unable to authenticate: Auth error."));
          done();
        });
    });

    it("should have valid token and refresh token if authorization succeeded", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", secret: "validSecret"})
        .then((output: TokenManager) => {
          expect(output instanceof TokenManager).toBe(true);
          expect(output.token).toBe("validToken");
          expect((output as any).refreshToken).toBe("validRefreshToken");
          done();
        })
        .catch((err: Error) => {
          done.fail("should not have failed");
        });
    });

    it("should throw an error if on refresh token failure", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((output: TokenManager) => {
          (output as any).tokens = {token: "validToken", refreshToken: "invalidRefreshToken"};
          setTimeout(() => {
            expect(() => output.token).toThrow(new Error("TokenManager does not contain a valid token."));
            done();
          }, 1000);
        })
        .catch((err) => {
          done.fail("should not have failed");
        });
    });

    it("should have updated token and refresh token after successful auto refresh", (done) => {
      (new TokenManager(mockRequestAdapter))
        .init({appUrl: "validUrl", key: "validKey", refreshInterval: 500, secret: "validSecret"})
        .then((output: TokenManager) => {
          setTimeout(() => {
            expect(output.token).toBe("updatedToken");
            expect((output as any).refreshToken).toBe("updatedRefreshToken");
            done();
          }, 1000);
        })
        .catch((err) => {
          done.fail("should not have failed");
        });
    });
  });
});
