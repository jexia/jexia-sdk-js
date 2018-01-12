// tslint:disable:max-line-length
import { ApiKeyAuth } from "../src/api/auth/apiKeyAuth";
import { Tokens } from "../src/api/core/tokenManager";
import { API } from "../src/config/config";
import { IRequestAdapter, Methods } from "../src/internal/requestAdapter";

describe("ApiKeyAuth", () => {

  const validOpts = () => ({ projectID: "validProjectID", key: "validKey", refreshInterval: 500, secret: "validSecret" });

  function createSubject({
    tokens = { token: "test-token", refresh_token: "test-refresh-token" } as Tokens,
    resultValue = tokens,
    resultPromise = Promise.resolve(resultValue),
  } = {} as any) {
    const requestAdapter = jasmine.createSpyObj<IRequestAdapter>("requestAdapterMock", ["execute"]);
    (requestAdapter.execute as jasmine.Spy).and.returnValue(resultPromise);
    return {
      tokens,
      tokenPair: Promise.resolve({ token: tokens.token, refreshToken: tokens.refresh_token }),
      requestAdapter,
      resultValue,
      resultPromise,
      clientOpts: validOpts(),
      subject: new ApiKeyAuth(),
    };
  }

  describe("when login in", () => {

    it("should make request to the right url", () => {
      const { subject, clientOpts, requestAdapter } = createSubject();
      subject.login(clientOpts, requestAdapter);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        `${API.PROTOCOL}://${clientOpts.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.API_KEY}`,
        jasmine.anything(),
      );
    });

    it("should make request to the right content", () => {
      const { subject, clientOpts, requestAdapter } = createSubject();
      subject.login(clientOpts, requestAdapter);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({
          body: {
            key: clientOpts.key,
            secret: clientOpts.secret,
          },
          method: Methods.POST,
        }),
      );
    });

    it("should convert result value to IAuthToken interface", async () => {
      const { subject, clientOpts, requestAdapter, resultValue } = createSubject();
      const result = await subject.login(clientOpts, requestAdapter);
      expect(result).toEqual({
        refreshToken: resultValue.refresh_token,
        token: resultValue.token,
      });
    });

    it("should add specific information to the request error", async () => {
      const resultError = { message: "result error message" };
      const { subject, clientOpts, requestAdapter } = createSubject({ resultPromise: Promise.reject(resultError) });
      try {
        await subject.login(clientOpts, requestAdapter);
        throw new Error("should throw an request error");
      } catch (error) {
        expect(error.message).toBe("Unable to authenticate: " + resultError.message);
      }
    });

  });

  describe("when refreshing the token", () => {

    it("should make request to the right url", async () => {
      const { subject, clientOpts, requestAdapter, tokenPair } = createSubject();
      await subject.refresh(tokenPair, requestAdapter, clientOpts.projectID);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        `${API.PROTOCOL}://${clientOpts.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.API_KEY}`,
        jasmine.anything(),
      );
    });

    it("should make request to the right content", async () => {
      const { subject, clientOpts, requestAdapter, tokens, tokenPair } = createSubject();
      await subject.refresh(tokenPair, requestAdapter, clientOpts.projectID);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        jasmine.anything(),
        jasmine.objectContaining({
          body: { refresh_token: tokens.refresh_token },
          headers: { Authorization: tokens.token },
          method: Methods.PATCH,
        }),
      );
    });

    it("should convert result value to IAuthToken interface", async () => {
      const { subject, clientOpts, requestAdapter, resultValue, tokenPair } = createSubject();
      const result = await subject.refresh(tokenPair, requestAdapter, clientOpts.projectID);
      expect(result).toEqual({
        refreshToken: resultValue.refresh_token,
        token: resultValue.token,
      });
    });

    it("should add specific information to the request error", async () => {
      const resultError = { message: "result error message" };
      const { subject, clientOpts, requestAdapter, tokenPair } = createSubject({ resultPromise: Promise.reject(resultError) });
      try {
        await subject.refresh(tokenPair, requestAdapter, clientOpts.projectID);
        throw new Error("should throw an request error");
      } catch (error) {
        expect(error.message).toBe("Unable to refresh token: " + resultError.message);
      }
    });

  });

});
