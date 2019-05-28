import * as faker from "faker";
import { getRandomQueryAction, requestAdapterMockFactory } from "../../spec/testUtils";
import { TokenManager } from "../api/core/tokenManager";
import { API } from "../config/config";
import { IRequestExecuterData } from "./../../dist/internal/executer.interfaces.d";
import { QueryAction } from "./../api/dataops/queries/baseQuery";
import { RequestExecuter } from "./executer";
import { Methods } from "./requestAdapter";
import { deferPromise } from "./utils";

describe("QueryExecuter class", () => {
  const validToken = faker.random.alphaNumeric();
  const dataset = faker.random.word();
  const projectID = faker.random.uuid();
  const restUrl = `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}` +
    `/${API.DATA.ENDPOINT}/${dataset}`;

  const QUERY_ACTION = getRandomQueryAction();

  const createSubject = ({
    reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution(),
    clientInit = Promise.resolve(),
    tokenManagerMock = {
      token(): Promise<string> {
        return Promise.resolve(validToken);
      },
    } as TokenManager,
  } = {}) => {
    return {
      dataset,
      clientInit,
      reqAdapterMock,
      tokenManagerMock,
      subject: new RequestExecuter(
        { projectID } as any,
        dataset,
        clientInit,
        reqAdapterMock,
        tokenManagerMock,
      ),
    };
  };

  describe("when creating the QueryExecuter", () => {
    it("should create a valid object", () => {
      const { subject } = createSubject();
      expect(subject).toBeTruthy();
    });
  });

  describe("getRequestUrl method", () => {
    it("should use rest api endpoint for the rest request", () => {
      const { subject } = createSubject();
      const url = (subject as any).getUrl();
      expect(url).toEqual(restUrl);
    });
  });

  describe("when calling", () => {
    let subject: any;

    it("executeRestMethod() should call method to get URL", async () => {
      ({ subject } = createSubject({
        reqAdapterMock: requestAdapterMockFactory().genericSuccesfulExecution()
      }));
      spyOn(subject, "getURI");
      await subject.executeRequest([]);
      expect(subject.getURI).toHaveBeenCalled();
    });

    describe("getURI method", () => {
      beforeEach(() => {
        ({ subject } = createSubject());
      });

      it("should call method to get url", () => {
        spyOn(subject, "getUrl");
        subject.getURI([]);

        expect(subject.getUrl).toHaveBeenCalled();
      });

      it("should call method to parse params", () => {
        const queryParams = [];

        spyOn(subject, "parseQueryParams");
        subject.getURI(queryParams);

        expect(subject.parseQueryParams).toHaveBeenCalledWith(queryParams);
      });

      it("should concatenate URL + query params ", () => {
        const queryParams = [];

        expect(subject.getURI(queryParams)).toEqual(
          subject.getUrl() + subject.parseQueryParams(queryParams)
        );
      });
    });

    describe("parseQueryParams method", () => {
      beforeEach(() => {
        ({ subject } = createSubject());
      });

      it("should return empty string when argument is empty", () => {
        expect(subject.parseQueryParams([])).toBe("");
      });

      it("should parse to the correct format for non-string values", () => {
        const key = faker.random.word();
        const value = faker.helpers.randomize([
          [],
          faker.random.number(),
          {},
          faker.random.boolean(),
        ]);

        const queryParams = [
          { key, value },
        ];

        const encodeValue = (v: any) => encodeURIComponent(JSON.stringify(v));
        const expectedParams = `?${key}=${encodeValue(value)}`;

        expect(subject.parseQueryParams(queryParams)).toEqual(expectedParams);
      });

      it("should parse to the correct format for string values", () => {
        const key = faker.random.word();
        const value = faker.random.words();

        const queryParams = [
          { key, value },
        ];

        const encodeValue = (v: any) => encodeURIComponent(v);

        const expectedParams = `?${key}=${encodeValue(value)}`;

        expect(subject.parseQueryParams(queryParams)).toEqual(expectedParams);
      });

      it("should separate params by ampersand", () => {
        const key1 = faker.random.word();
        const key2 = faker.random.word();
        const key3 = faker.random.word();

        const queryParams = [
          { key: key1, value: faker.random.number() },
          { key: key2, value: faker.random.number() },
          { key: key3, value: faker.random.number() },
        ];

        const result: string = subject.parseQueryParams(queryParams);

        expect(result.match(/&/g).length).toEqual(queryParams.length - 1);
      });

      it("should concatenate URL + query params ", () => {
        const queryParams = [];
        ({ subject } = createSubject());

        expect(subject.getURI(queryParams)).toEqual(
          subject.getUrl() + subject.parseQueryParams(queryParams)
        );
      });
    });
  });

  const actions = [
    { action: QueryAction.insert, expected: Methods.POST, hasBody: true },
    { action: QueryAction.delete, expected: Methods.DELETE, hasBody: false },
    { action: QueryAction.select, expected: Methods.GET, hasBody: false },
    { action: QueryAction.update, expected: Methods.PATCH, hasBody: true },
  ];

  describe("on calling getMethod()", () => {
    actions.forEach(({ action, expected }) => {
      it(`should return ${expected} for ${action}`, async () => {
        const { subject } = createSubject();
        expect(subject.getMethod(action)).toBe(expected);
      });
    });
  });

  describe("when calling execute() method", () => {
    const mockRequest: IRequestExecuterData = { action: QUERY_ACTION };

    it("should pass default params down to the request adapter", async () => {
      const { subject, reqAdapterMock } = createSubject();
      await subject.executeRequest(mockRequest);
      expect(reqAdapterMock.execute).toHaveBeenCalledWith(
        restUrl,
        {
          headers: { Authorization: `Bearer ${validToken}` },
          method: subject.getMethod(QUERY_ACTION),
        },
      );
    });

    const withoutBody = actions.filter((action) => !action.hasBody);

    withoutBody.forEach(({ action, expected }) => {
      it("should pass no body for GET requests", async () => {
        const { subject, reqAdapterMock } = createSubject();

        await subject.executeRequest({
          action,
          body: {},
        });

        expect(reqAdapterMock.execute).toHaveBeenCalledWith(
          restUrl,
          {
            headers: { Authorization: `Bearer ${validToken}` },
            method: expected,
          },
        );
      });
    });

    const withBody = actions.filter((action) => action.hasBody);

    withBody.forEach(({ action, expected }) => {
      it("should pass the proper options down to the request adapter", async () => {
        const { subject, reqAdapterMock } = createSubject();
        const fakeBody = {
          someObject: faker.random.number(),
        };
        await subject.executeRequest({
          action,
          body: fakeBody,
        });

        expect(reqAdapterMock.execute).toHaveBeenCalledWith(
          restUrl,
          {
            headers: { Authorization: `Bearer ${validToken}` },
            body: fakeBody,
            method: expected,
          }
        );
      });
    });

    it("should wait the system initialization before execute the query", async (done) => {
      const defer = deferPromise();
      const { subject, reqAdapterMock } = createSubject({
        clientInit: defer.promise,
      });
      subject.executeRequest({ action: QUERY_ACTION });
      setTimeout(() => {
        expect(reqAdapterMock.execute).not.toHaveBeenCalled();
        done();
      });
    });

    it("should not execute the query if there is an error on system initialization", async () => {
      const initError = "system initialization error";
      const { subject, reqAdapterMock } = createSubject({
        clientInit: Promise.reject(initError),
      });

      try {
        await subject.executeRequest({ action: QUERY_ACTION });
        throw new Error("request execution should have throw an error");
      } catch (error) {
        expect(error).toBe(initError);
      } finally {
        expect(reqAdapterMock.execute).not.toHaveBeenCalled();
      }
    });

    it("should throw server errors back to the caller", async () => {
      const serverError = "Server error";
      const { subject } = createSubject({
        reqAdapterMock: requestAdapterMockFactory().failedExecution(serverError)
      });
      const mockBody = { action: QUERY_ACTION, body: {} };
      try {
        await subject.executeRequest(mockBody);
      } catch (err) {
        expect(err.message).toEqual(serverError);
      }
    });
  });
});
