// tslint:disable:max-line-length
import { createMockFor } from "../../../spec/testUtils";
import { Tokens } from "../../api/core/tokenManager";
import { API } from "../../config";
import { IRequestAdapter, Methods } from "../../internal/requestAdapter";
import { UserCredentialsAuth } from "./userCredentialsAuth";

describe("UserCredentialsAuth", () => {

  const validOpts = () => ({ projectID: "validProjectID", key: "validKey", refreshInterval: 500, secret: "validSecret" });

  function createSubject({
    tokens = { token: "test-token", refresh_token: "test-refresh-token" } as Tokens,
    resultValue = tokens,
    resultPromise = Promise.resolve(resultValue),
  } = {} as any) {
    const requestAdapter: IRequestAdapter = createMockFor(["execute"], { returnValue: resultPromise });
    return {
      clientOpts: validOpts(),
      requestAdapter,
      resultValue,
      resultPromise,
      subject: new UserCredentialsAuth(),
      tokens,
      tokenPair: Promise.resolve({ token: tokens.token, refreshToken: tokens.refresh_token }),
    };
  }

  describe("when logging in", () => {

    it("should make request to the right url", () => {
      const { subject, clientOpts, requestAdapter } = createSubject();
      subject.login(clientOpts, requestAdapter);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        `${API.PROTOCOL}://${clientOpts.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.USER_CREDENTIALS}`,
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
            email: clientOpts.key,
            password: clientOpts.secret,
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
        expect(error.message).toBe(`Unable to authenticate: [POST ${(subject as any).buildLoginUrl(validOpts().projectID)}] ` + resultError.message);
      }
    });

  });

  describe("when refreshing the token", () => {

    it("should make request to the right url", async () => {
      const { subject, clientOpts, requestAdapter, tokenPair } = createSubject();
      await subject.refresh(tokenPair, requestAdapter, clientOpts.projectID);
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        `${API.PROTOCOL}://${clientOpts.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}/${API.AUTH.USER_CREDENTIALS}/refresh`,
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
          method: Methods.POST,
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
