// tslint:disable:max-line-length
import * as faker from "faker";
import { requestAdapterMockFactory } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { Methods } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { API } from "./../../config/config";
import { RequestAdapter } from "./../../internal/requestAdapter";
import { IStorageComponent, TokenStorage } from "./componentStorage";
import { APIKEY_DEFAULT_ALIAS, TokenManager, Tokens } from "./tokenManager";

describe("Class: TokenManager", () => {
  let subject: TokenManager;
  let requestAdapter: RequestAdapter;
  let logger: Logger;
  let storage: IStorageComponent;

  const VALID_PROJECT_ID = "validProjectID";
  const DEFAULT_TOKEN: Readonly<Tokens> = {
    access_token: faker.random.word(),
    refresh_token: faker.random.word(),
  };

  const validOpts = () => ({
    projectID: VALID_PROJECT_ID,
    key: faker.random.word(),
    refreshInterval: 500,
    secret: faker.random.word(),
  });

  function createSubject({
    adapter = requestAdapterMockFactory().succesfulExecution(DEFAULT_TOKEN),
    log = new Logger(),
  } = {}) {
    return {
      requestAdapter: adapter,
      logger: log,
      storage: TokenStorage.getStorageAPI(),
      subject: new TokenManager(adapter, log),
    };
  }

  beforeEach(() => {
    expect.assertions(1);
    jest.useFakeTimers();
    jest.clearAllTimers();
    TokenStorage.getStorageAPI().clear();
    ({ logger, requestAdapter, storage, subject } = createSubject());
  });

  it("should set storage defaults", () => {
    spyOn(storage, "setDefault");

    const auth = faker.random.word();
    subject.setDefault(auth);

    expect(storage.setDefault).toHaveBeenCalledWith(auth);
  });

  it("should set default alias when reseting", () => {
    spyOn(storage, "setDefault");
    subject.resetDefault();

    expect(storage.setDefault).toHaveBeenCalledWith(APIKEY_DEFAULT_ALIAS);
  });

  describe("when authenticating", () => {
    it("should throw an error if project ID is not provided", async () => {
      try {
        await subject.init(Object.assign(validOpts(), { projectID: "" }));
        throw new Error("should have thrown error");
      } catch (error) {
        expect(error).toEqual(new Error("Please supply a valid Jexia project ID."));
      }
    });

    it("should throw an error if authentication failed", async () => {
      const errorMessage = faker.lorem.sentence();

      ({ subject } = createSubject({
        adapter: requestAdapterMockFactory().failedExecution(errorMessage),
       }));

      await expect(
        subject.init(Object.assign(validOpts(), { key: "invalid", secret: "invalid" }))
      ).rejects.toThrowError();
    });

    it("should fail initialization when login fails", async () => {
      spyOn(storage, "isEmpty").and.returnValue(true);
      const loginError = "loginError";
      spyOn(subject as any, "login").and.returnValue(Promise.reject(loginError));
      try {
        await subject.init(validOpts());
        throw new Error("init should have failed!");
      } catch (error) {
        expect(error).toBe(loginError);
      }
    });

    it("should result itself at then promise when authorization succeeded", async () => {
      try {
        const result = await subject.init(validOpts());
        expect(result).toBe(subject);
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should have valid token and refresh token if authorization succeeded", async () => {
      try {
        const tokenManager: TokenManager = await subject.init(validOpts());
        const token: string = await tokenManager.token();
        expect(token).toBe(DEFAULT_TOKEN.access_token);
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should throw an error if the token is accessed before login", async () => {
      try {
        await subject.token();
        throw new Error("token() should have failed!");
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
      }
    });
  });

  describe("when the client is terminated", () => {
    it("should clear session storage", async () => {
      spyOn(storage, "clear");
      try {
        await subject.init(validOpts());
        await subject.terminate();

        expect(storage.clear).toHaveBeenCalledWith();
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should clear refresh", async () => {
      try {
        await subject.init(validOpts());
        await subject.terminate();

        expect(global.clearInterval).toHaveBeenCalledWith(expect.any(Number));
      } catch (error) {
        expect(error).not.toBeDefined();
      }
    });

    it("should throw an error if the token is accessed afterwards", async () => {
      try {
        await subject.init(validOpts());
        subject.terminate();
        await subject.token();
      } catch (error) {
        expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
      }
    });
  });

  describe("when refreshing the token", () => {
    const authName = faker.random.word();

    function addTokens(clearToken = true) {
      subject.addTokens(authName, DEFAULT_TOKEN);

      if (clearToken) {
        storage.clear();
      }

      jest.runOnlyPendingTimers();
      return Promise.resolve()
        .then(() => { jest.runOnlyPendingTimers(); });
    }

    it("should make the request using the token", async () => {
      subject.addTokens("testRefresh", DEFAULT_TOKEN);

      jest.runOnlyPendingTimers();
      expect(requestAdapter.execute).toHaveBeenCalledWith(
        jasmine.stringMatching(API.REFRESH),
        {
          body: { refresh_token: DEFAULT_TOKEN.refresh_token },
          method: Methods.POST
        },
      );
    });

    describe("when there is no token to refresh", () => {
      it("should terminate", async () => {
        try {
          spyOn(subject, "terminate").and.callThrough();
          await addTokens();
          expect(subject.terminate).toHaveBeenCalledTimes(1);
        } catch (error) {
          expect(error).not.toBeDefined();
        }
      });

      it("should log error", async () => {
        try {
          spyOn(logger, "error").and.callThrough();
          await addTokens();
          expect(logger.error).toHaveBeenCalledWith(
            "tokenManager",
            `There is no refresh token for ${authName}`,
          );
        } catch (error) {
          expect(error).not.toBeDefined();
        }
      });
    });

    describe("when request fails", () => {
      const errorMessage = faker.lorem.sentence();

      beforeEach(() => {
        ({ logger, requestAdapter, storage, subject } = createSubject({
          adapter: requestAdapterMockFactory().failedExecution(errorMessage),
        }));
      });

      it("should terminate", async () => {
        try {
          spyOn(subject, "terminate");
          await addTokens(false);
          expect(subject.terminate).toHaveBeenCalledTimes(1);
        } catch (error) {
          expect(error).not.toBeDefined();
        }
      });

      it("should log error", async () => {
        try {
          spyOn(logger, "error").and.callThrough();
          await addTokens(false);
          expect(logger.error).toHaveBeenCalledWith(
            "tokenManager",
            `Unable to refresh token: ${errorMessage}`,
          );
        } catch (error) {
          expect(error).not.toBeDefined();
        }
      });
    });
  });

});
