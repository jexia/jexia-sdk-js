import * as faker from "faker";
import { Observable, of, throwError } from "rxjs";
import { createMockFor, mockRequestError, validClientOpts } from "../../../spec/testUtils";
import { MESSAGE, getProjectId } from "../../config";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { TokenManager, Tokens } from "./tokenManager";
import { createTestToken } from "../../../spec/token";

let terminate: () => void;

interface ISubjectOpts {
  tokens: Tokens;
  requestAdapterReturnValue: Observable<Tokens>;
  requestAdapterMock: RequestAdapter;
  loggerMock: Logger;
}

const createSubject = ({
  tokens = { access_token: createTestToken(), refresh_token: faker.random.word() },
  requestAdapterReturnValue = of(tokens),
  requestAdapterMock = createMockFor(RequestAdapter, { returnValue: requestAdapterReturnValue }),
  loggerMock = createMockFor(Logger),
}: Partial<ISubjectOpts> = {}) => {
  const subject = new TokenManager(requestAdapterMock, loggerMock);
  terminate = () => subject.terminate();
  return {
    subject,
    tokens,
    requestAdapterReturnValue,
    requestAdapterMock,
    loggerMock,
    validOptions: validClientOpts,
  };
};

describe("TokenManager", () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(async () => {
    await terminate();
    jest.useRealTimers();
  });

  describe("when initialize", () => {

    ["", null].forEach((value) => {
      it(`should throw an error when project id and project url is "${value}"`, async () => {
        const { subject } = createSubject();
        try {
          await subject.init({ projectID: value, projectURL: value });
          throw new Error("should not reach this line");
        } catch (error) {
          expect(error).toEqual(subject.authOptionsError);
        }
      });
    });

    it(`should NOT throw an error when project id is provided when url don't`, async () => {
      const { subject, validOptions: { projectURL } } = createSubject();
      let hasError = false;
      try {
        await subject.init({
          projectID: "",
          projectURL,
        });
      } catch (error) {
        hasError = true;
      } finally {
        expect(hasError).toBe(false);
      }
    });

    it(`should NOT throw an error when project url is provided when id don't`, async () => {
      const { subject, validOptions: { projectID } } = createSubject();
      let hasError = false;
      try {
        await subject.init({
          projectID,
          projectURL: "",
        });
      } catch (error) {
        hasError = true;
      } finally {
        expect(hasError).toBe(false);
      }
    });

    it("should authorize if there are key and secret", async () => {
      const { subject, validOptions, requestAdapterMock } = createSubject();
      await subject.init(validOptions);
      expect(requestAdapterMock.execute).toHaveBeenCalledWith(
        expect.any(String), // url does not matter
        {
          body: { method: "apk", key: validOptions.key, secret: validOptions.secret },
          method: RequestMethod.POST,
        },
      );
    });

    it("should not authorize if there are neither key nor secret", async () => {
      const { subject, requestAdapterMock } = createSubject();
      await subject.init({ projectID: faker.random.uuid() });
      expect(requestAdapterMock.execute).not.toHaveBeenCalled();
    });

    it("should return resolved promise of itself for init without authorization", async () => {
      const { subject } = createSubject();
      const value = await subject.init({ projectID: faker.random.uuid() });
      expect(value).toEqual(subject);
    });
  });

  describe("when authenticating", () => {
    it("should throw an error if project not found", async () => {
      const { subject, validOptions } = createSubject({
        requestAdapterReturnValue: throwError({
          httpStatus: { code: 404 },
        }),
      });
      await subject.init(validOptions)
        .catch((error) => expect(error.message).toEqual(`Authorization failed: project ${getProjectId(validOptions)} not found.`));
    });

    it("should throw http status when an http error occurs", async () => {
      const httpStatus = {
        code: faker.helpers.randomize([404, 401, 500]),
        status: faker.lorem.sentence(),
      };
      const { subject, validOptions } = createSubject({
        requestAdapterReturnValue: throwError({ httpStatus }),
      });

      await subject.init(validOptions)
        .catch((error) => expect(error.httpStatus).toEqual(httpStatus));
    });

    it("should throw an error if authorization failed", async () => {
      const { subject, validOptions } = createSubject({
        requestAdapterReturnValue: throwError({
          httpStatus: { code: 500, status: "Server error" },
        }),
      });
      await subject.init(validOptions)
        .catch((error) => expect(error.message)
          .toEqual(`Authorization failed: 500 Server error`));
    })

    it("should result promise of itself when authorization succeeded", async () => {
      const { subject, validOptions } = createSubject();
      const value = await subject.init(validOptions);
      expect(value).toEqual(subject);
    });

    it("should schedule token refreshing when authorization is succeeded", async () => {
      const { subject, validOptions, tokens } = createSubject();
      jest.spyOn(subject as any, "startRefreshDigest");
      await subject.init(validOptions);
      expect((subject as any).startRefreshDigest).toHaveBeenCalledWith(["apikey"], tokens.access_token);
    });

    it("should schedule token refreshing for the authentication by alias", async () => {
      const { subject, validOptions, tokens } = createSubject();
      const auth = faker.random.word();
      jest.spyOn(subject as any, "startRefreshDigest");
      await subject.init({ ...validOptions, auth });
      expect((subject as any).startRefreshDigest).toHaveBeenCalledWith([auth], tokens.access_token);
    });

    describe("get error message", () => {
      it("should return not found error if received 404", () => {
        const { subject,  } = createSubject();
        const projectID = faker.random.uuid();

        subject.init({ projectID });

        expect(subject.getErrorMessage(mockRequestError({ code: 404 })))
          .toEqual(`Authorization failed: project ${projectID} not found.`);
      });

      it("should return code and status for any not 404 error", () => {
        const { subject,  } = createSubject();

        const requestError = mockRequestError({ code: faker.helpers.randomize([401, 403, 407, 500]) });

        expect(subject.getErrorMessage(requestError))
          .toEqual(`Authorization failed: ${requestError.httpStatus.code} ${requestError.httpStatus.status}`);
      });
    });
  });

  describe("when get a token", () => {
    it("should return default token if authorization succeeded", async (done) => {
      const { subject, validOptions, tokens } = createSubject();
      await subject.init(validOptions);
      subject.token().subscribe(
        (token) => expect(token).toEqual(tokens.access_token),
        done,
        done,
      );
    });

    it("should return a token by auth alias if authorized with alias", async (done) => {
      const { subject, validOptions, tokens } = createSubject();
      const randomAlias = faker.random.word();
      await subject.init({ ...validOptions, auth: randomAlias });
      subject.token(randomAlias).subscribe(
        (token) => expect(token).toEqual(tokens.access_token),
        done,
        done,
      );
    });

    it("should return a token set by default", async (done) => {
      const { subject, validOptions } = createSubject();
      const randomAlias = faker.random.word();
      const anotherTokens = {
        access_token: createTestToken(),
        refresh_token: faker.random.word(),
      };
      await subject.init(validOptions);
      subject.addTokens([randomAlias], anotherTokens);
      subject.setDefault(randomAlias);
      subject.token().subscribe(
        (token) => expect(token).toEqual(anotherTokens.access_token),
        done,
        done,
      );
    });

    it("should return a token by any of aliases if there are few", async (done) => {
      const { subject, validOptions } = createSubject();
      const randomAliases = [faker.random.word(), faker.random.word(), faker.random.word()];
      const randomAlias = faker.helpers.randomize(randomAliases);
      const anotherTokens = {
        access_token: createTestToken(),
        refresh_token: faker.random.word(),
      };
      await subject.init(validOptions);
      subject.addTokens(randomAliases, anotherTokens);
      subject.token(randomAlias).subscribe(
        (token) => expect(token).toEqual(anotherTokens.access_token),
        done,
        done,
      );
    });

    it("should return default token after reset to default", async (done) => {
      const { subject, validOptions, tokens } = createSubject();
      const randomAlias = faker.random.word();
      const anotherTokens = {
        access_token: createTestToken(),
        refresh_token: faker.random.word(),
      };
      await subject.init(validOptions);
      subject.addTokens([randomAlias], anotherTokens);
      subject.setDefault(randomAlias);
      subject.resetDefault();
      subject.token().subscribe(
        (token) => expect(token).toEqual(tokens.access_token),
        done,
        done,
      );
    });

    describe("return a new token after refresh", () => {
      it("should return the new token", async (done) => {
        const { subject, validOptions } = createSubject();
        const randomAlias = faker.random.word();
        const tokens = {
          access_token: createTestToken(true),
          refresh_token: faker.random.word(),
        };
        const refreshedTokens = {
          access_token: createTestToken(),
          refresh_token: faker.random.word(),
        };

        jest.spyOn(subject as any, "refresh").mockReturnValue(of(refreshedTokens));
        await subject.init(validOptions);
        subject.addTokens([randomAlias], tokens);
        subject.setDefault(randomAlias);
        subject.token().subscribe(
          (token) => expect(token).toEqual(refreshedTokens.access_token),
          done,
          done,
        );
      });

      it("should remove the current digest", async (done) => {
        const { subject, validOptions } = createSubject();
        const randomAlias = faker.random.word();
        const tokens = {
          access_token: createTestToken(true),
          refresh_token: faker.random.word(),
        };

        jest.spyOn(subject as any, "removeRefreshDigest");

        await subject.init(validOptions);
        subject.addTokens([randomAlias], tokens);
        subject.setDefault(randomAlias);
        subject.token().subscribe(
          () => expect((subject as any).removeRefreshDigest).toHaveBeenCalled(),
          done,
          done,
        );
      });

      it("should set a new digest", async (done) => {
        const { subject, validOptions } = createSubject();
        const randomAlias = faker.random.word();
        const tokens = {
          access_token: createTestToken(true),
          refresh_token: faker.random.word(),
        };

        jest.spyOn(subject as any, "startRefreshDigest");

        await subject.init(validOptions);
        subject.addTokens([randomAlias], tokens);
        subject.setDefault(randomAlias);
        subject.token().subscribe(
          () => expect((subject as any).startRefreshDigest).toHaveBeenCalled(),
          done,
          done,
        );
      });
    });

    it("should throw an error if the token is accessed before login", (done) => {
      const { subject } = createSubject();

      subject.token().subscribe(
        () => done("successfully received the token"),
        (error) => {
          expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
          done();
        },
      );
    });

    it("should throw an error if accessed nonexistent token", async (done) => {
      const { subject, validOptions } = createSubject();
      await subject.init(validOptions);

      subject.token("randomToken").subscribe(
        () => done("successfully received the token"),
        (error) => {
          expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
          done();
        },
      );
    });

    it("should return a token if authorized by alias and get default token", async (done) => {
      const { subject, validOptions, tokens } = createSubject();
      await subject.init({ ...validOptions, auth: faker.random.word() });
      subject.token().subscribe(
        (token) => expect(token).toEqual(tokens.access_token),
        done,
        done,
      );
    });
  });

  describe("when the client is terminated", () => {
    it("should have clear the session storage", async () => {
      const { subject, validOptions } = createSubject();
      const storage = (subject as any).storage;
      const clear = storage.clear.bind(storage);
      spyOn(storage, "clear");
      await subject.init(validOptions);
      await subject.terminate();
      expect(storage.clear).toHaveBeenCalledWith();
      clear();
    });

    it("should clear all refreshing timeouts", async () => {
      const { subject, validOptions } = createSubject();
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
      await subject.init(validOptions);
      await subject.addTokens([faker.random.word()], {
        access_token: createTestToken(),
        refresh_token: faker.random.word(),
      });
      const [ firstTimeout, secondTimeout ] = Array.from((subject as any).refreshes.values());
      await subject.terminate();
      // @ts-ignore
      expect(global.clearTimeout).toHaveBeenNthCalledWith(1, firstTimeout);
      // @ts-ignore
      expect(global.clearTimeout).toHaveBeenNthCalledWith(2, secondTimeout);
      expect((subject as any).refreshes.size).toBe(0);
      clearTimeoutSpy.mockRestore();
    });

    it("should throw an error if the token is accessed after terminate", async (done) => {
      const { subject, validOptions } = createSubject();
      await subject.init(validOptions);
      await subject.terminate();

      subject.token().subscribe(
        () => done("successfully received the token"),
        (error) => {
          expect(error.message).toEqual(MESSAGE.TokenManager.TOKEN_NOT_AVAILABLE);
          done();
        },
      );
    });
  });

  describe("when refreshing the token", () => {
    describe("when time for refreshing has come", () => {

      it("should print debug message", async () => {
        const { subject, loggerMock, validOptions } = createSubject();
        await subject.init(validOptions);
        jest.runOnlyPendingTimers();
        expect(loggerMock.debug).toHaveBeenCalledWith("tokenManager", "refresh apikey token");
      });

      it("should refresh the token", async () => {
        const { subject, validOptions } = createSubject();
        await subject.init(validOptions);
        jest.spyOn(subject as any, "refresh");
        jest.runOnlyPendingTimers();
        expect((subject as any).refresh).toHaveBeenCalledWith(["apikey"]);
      });

      it("should terminate itself if there is an error during refresh", async () => {
        const { subject, validOptions } = createSubject();
        await subject.init(validOptions);
        jest.spyOn(subject as any, "refresh").mockReturnValue(throwError("refresh error"));
        jest.spyOn(subject, "terminate");
        jest.runOnlyPendingTimers();
        return Promise.resolve().then(
          () => expect(subject.terminate).toHaveBeenCalled());
      });
    });

    it("should take refresh token from storage and use it to make a request", async () => {
      const { subject, validOptions, tokens, requestAdapterMock } = createSubject();
      await subject.init(validOptions);
      (subject as any).refresh();
      expect(requestAdapterMock.execute).toHaveBeenCalledWith(
        (subject as any).refreshUrl,
        {
          body: { refresh_token: tokens.refresh_token },
          method: RequestMethod.POST
        },
      );
    });

    it("should reject promise if there is no token for specific auth", () => {
      const { subject } = createSubject();
      (subject as any).storage.setTokens("testRefresh",
        { access_token: createTestToken(), refresh_token: "refresh_token" });
      try {
        (subject as any).refresh(["randomAuth"]);
      } catch (error) {
        expect(error.message).toEqual("There is no refresh token for randomAuth");
      }
    });

    it("should throw an error if request failed", async (done) => {
      const { subject, validOptions, tokens, requestAdapterMock } = createSubject();
      await subject.init(validOptions);
      (subject as any).storage.setTokens("testRefresh", tokens);

      (requestAdapterMock.execute as jest.Mock).mockReturnValue(throwError({ httpStatus: { code: 500 }}));

      (subject as any).refresh(["testRefresh"]).subscribe(
        () => done.fail("successfully refreshed the token"),
        (error: Error) => {
          expect(error.message).toEqual("Refreshing token failed");
          done();
        },
        () => done.fail("completed without error"),
      );
    });
  });
});
