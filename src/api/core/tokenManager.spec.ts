import * as faker from "faker";
import { Observable, of, throwError } from "rxjs";
import { createMockFor } from "../../../spec/testUtils";
import { MESSAGE } from "../../config";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { Logger } from "../logger/logger";
import { TokenManager, Tokens } from "./tokenManager";

const validProjectID = "validProjectID";
let terminate: () => void;

interface ISubjectOpts {
  tokens: Tokens;
  requestAdapterReturnValue: Observable<Tokens>;
  requestAdapterMock: RequestAdapter;
  loggerMock: Logger;
}

const createSubject = ({
  tokens = { access_token: faker.random.word(), refresh_token: faker.random.word() },
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
    validOptions: {
      projectID: validProjectID,
      key: faker.random.word(),
      refreshInterval: faker.random.number({ min: 100, max: 1000 }),
      secret: faker.random.word(),
    },
  };
};

describe("TokenManager", () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(async () => {
    await terminate();
    jest.useRealTimers();
  });

  describe("when initialize", () => {
    it("should throw an error if project id is not provided", async () => {
      const { subject } = createSubject();
      try {
        await subject.init({ projectID: "" });
        throw new Error("should have throw app URL error");
      } catch (error) {
        expect(error).toEqual(new Error("Please supply a valid Jexia project ID."));
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
      await subject.init({ projectID: validProjectID });
      expect(requestAdapterMock.execute).not.toHaveBeenCalled();
    });

    it("should return resolved promise of itself for init without authorization", async () => {
      const { subject } = createSubject();
      const value = await subject.init({ projectID: validProjectID });
      expect(value).toEqual(subject);
    });
  });

  describe("when authenticating", () => {
    it("should throw an error if authentication failed", async () => {
      const { subject, validOptions } = createSubject({
        requestAdapterReturnValue: throwError(new Error("Auth error")),
      });
      await subject.init(validOptions)
        .catch((error) => expect(error.message).toEqual("Unable to get tokens: Auth error"));
    });

    it("should result promise of itself when authorization succeeded", async () => {
      const { subject, validOptions } = createSubject();
      const value = await subject.init(validOptions);
      expect(value).toEqual(subject);
    });

    it("should schedule token refreshing when authorization is succeeded", async () => {
      const { subject, validOptions } = createSubject();
      jest.spyOn(subject as any, "startRefreshDigest");
      await subject.init(validOptions);
      expect((subject as any).startRefreshDigest).toHaveBeenCalledWith(["apikey"]);
    });

    it("should schedule token refreshing for the authentication by alias", async () => {
      const { subject, validOptions } = createSubject();
      const auth = faker.random.word();
      jest.spyOn(subject as any, "startRefreshDigest");
      await subject.init({ ...validOptions, auth });
      expect((subject as any).startRefreshDigest).toHaveBeenCalledWith([auth]);
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
        access_token: faker.random.word(),
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
        access_token: faker.random.word(),
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
        access_token: faker.random.word(),
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

    it("should clear all refreshing intervals", async () => {
      const { subject, validOptions } = createSubject();
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");
      await subject.init(validOptions);
      await subject.addTokens([faker.random.word()], {
        access_token: faker.random.word(),
        refresh_token: faker.random.word(),
      });
      const [ firstInterval, secondInterval ] = (subject as any).refreshes;
      await subject.terminate();
      // @ts-ignore
      expect(global.clearInterval).toHaveBeenNthCalledWith(1, firstInterval);
      // @ts-ignore
      expect(global.clearInterval).toHaveBeenNthCalledWith(2, secondInterval);
      expect((subject as any).refreshes).toEqual([]);
      clearIntervalSpy.mockRestore();
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

    it("should reject promise if there is no token for specific auth", async () => {
      const { subject } = createSubject();
      (subject as any).storage.setTokens("testRefresh",
        { access_token: "access_token", refresh_token: "refresh_token" });
      try {
        await (subject as any).refresh(["randomAuth"]);
      } catch (error) {
        expect(error.message).toEqual("There is no refresh token for randomAuth");
      }
    });

    it("should throw an error if request failed", async (done) => {
      const { subject } = createSubject({
        requestAdapterReturnValue: throwError(new Error("refresh error")),
      });
      (subject as any).storage.setTokens("testRefresh",
        { access_token: "access_token", refresh_token: "refresh_token" });

      (subject as any).refresh(["testRefresh"]).subscribe(
        () => done("successfully refreshed the token"),
        (error: Error) => {
          expect(error.message).toEqual("Unable to get tokens: refresh error");
          done();
        },
      );
    });
  });
});
