import * as faker from "faker";
import { getRandomQueryAction, requestAdapterMockFactory } from "../../spec/testUtils";
import { TokenManager } from "../api/core/tokenManager";
import { API } from "../config/config";
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

    it("executeRestMethod() should call getUrl() method", async () => {
      ({ subject } = createSubject({
        reqAdapterMock: requestAdapterMockFactory().genericSuccesfulExecution()
      }));
      spyOn(subject, "getUrl");
      await subject.executeRequest([]);
      expect(subject.getUrl).toHaveBeenCalled();
    });
  });

  describe("on calling getMethod()", () => {
    const actions = [
      { action: QueryAction.insert, expected: Methods.POST },
      { action: QueryAction.delete, expected: Methods.DELETE },
      { action: QueryAction.select, expected: Methods.GET },
      { action: QueryAction.update, expected: Methods.PUT },
    ];

    actions.forEach(({ action, expected }) => {
      it(`should return ${expected} for ${action}`, async () => {
        const { subject } = createSubject();
        expect(subject.getMethod(action)).toBe(expected);
      });
    });
  });

  describe("when calling execute() method", () => {
    const mockRequest = { action: QUERY_ACTION };

    it("should pass default params down to the request adapter", async () => {
      const { subject, reqAdapterMock } = createSubject();
      await subject.executeRequest(mockRequest);
      expect(reqAdapterMock.execute).toHaveBeenCalledWith(
        restUrl,
        {
          headers: { Authorization: `Bearer ${validToken}` },
          body: {},
          method: subject.getMethod(QUERY_ACTION),
        },
      );
    });

    it("should pass the proper options down to the request adapter", async () => {
      const { subject, reqAdapterMock } = createSubject();
      const fakeBody = {
        someObject: faker.random.objectElement(),
      };
      await subject.executeRequest({
        action: QUERY_ACTION,
        body: fakeBody,
      });
      expect(reqAdapterMock.execute).toHaveBeenCalledWith(
        restUrl,
        jasmine.objectContaining({
          body: fakeBody,
        }),
      );
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
