import * as faker from "faker";
import { getRandomRequestMethod, requestAdapterMockFactory } from "../../spec/testUtils";
import { ResourceType } from "../api/core/resource";
import { TokenManager } from "../api/core/tokenManager";
import { API } from "../config/config";
import { RequestExecuter } from "./executer";
import { IRequestExecuterData } from "./executer.interfaces";
import { RequestMethod } from "./requestAdapter.interfaces";
import { deferPromise } from "./utils";

describe("QueryExecuter class", () => {
  const validToken = faker.random.alphaNumeric();
  const projectID = faker.random.uuid();
  const restDatasetUrl = (resourceName: string) => `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
    `:${API.PORT}/${API.DATA.ENDPOINT}/${resourceName}`;
  const restFilesetUrl = (resourceName: string) => `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
    `:${API.PORT}/${API.FILES.ENDPOINT}/${resourceName}`;

  const REQUEST_METHOD = getRandomRequestMethod();

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
      clientInit,
      reqAdapterMock,
      tokenManagerMock,
      subject: new RequestExecuter(
        { projectID } as any,
        clientInit,
        reqAdapterMock,
        tokenManagerMock,
      ) as any,
    };
  };

  describe("when creating the QueryExecuter", () => {
    it("should create a valid object", () => {
      const { subject } = createSubject();
      expect(subject).toBeTruthy();
    });
  });

  describe("getRequestUrl method", () => {
    it("should use dataset api endpoint for the dataset request", () => {
      const { subject } = createSubject();
      const mockRequest = {
        resourceName: faker.random.word(),
        resourceType: ResourceType.Dataset,
      };
      const url = subject.getUrl(mockRequest);
      expect(url).toEqual(restDatasetUrl(mockRequest.resourceName));
    });

    it("should use fileset api endpoint for the fileset request", () => {
      const { subject } = createSubject();
      const mockRequest = {
        resourceName: faker.random.word(),
        resourceType: ResourceType.Fileset,
      };
      const url = subject.getUrl(mockRequest);
      expect(url).toEqual(restFilesetUrl(mockRequest.resourceName));
    });
  });

  describe("when calling", () => {
    let subject: any;
    let requestData: any;

    describe("executeRequest method", () => {
      beforeEach(() => {
        subject = createSubject({
          reqAdapterMock: requestAdapterMockFactory().genericSuccesfulExecution()
        }).subject;
        requestData = { resourceName: faker.random.word() };
      });

      it("should get URL", async () => {
        spyOn(subject, "getUrl");
        await subject.executeRequest(requestData);
        expect(subject.getUrl).toHaveBeenCalledWith(requestData);
      });

      it("should parse query params", async () => {
        spyOn(subject, "parseQueryParams");
        await subject.executeRequest(requestData);
        expect(subject.parseQueryParams).toHaveBeenCalledWith(requestData);
      });

      it("should get request options", async () => {
        spyOn(subject, "getRequestOptions");
        await subject.executeRequest(requestData);
        expect(subject.getRequestOptions).toHaveBeenCalledWith(requestData);
      });

      it("should make a request with proper URL, params and options", async () => {
        await subject.executeRequest(requestData);
        expect(subject.requestAdapter.execute).toHaveBeenCalledWith(
          subject.getUrl(requestData) + subject.parseQueryParams(requestData),
          await subject.getRequestOptions(requestData),
        );
      });
    });

    describe("parseQueryParams method", () => {
      beforeEach(() => {
        ({ subject } = createSubject());
      });

      it("should return empty string when argument is empty", () => {
        expect(subject.parseQueryParams({})).toBe("");
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

        expect(subject.parseQueryParams({ queryParams })).toEqual(expectedParams);
      });

      it("should parse to the correct format for string values", () => {
        const key = faker.random.word();
        const value = faker.random.words();

        const queryParams = [
          { key, value },
        ];

        const encodeValue = (v: any) => encodeURIComponent(v);

        const expectedParams = `?${key}=${encodeValue(value)}`;

        expect(subject.parseQueryParams({ queryParams })).toEqual(expectedParams);
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

        const result: string = subject.parseQueryParams({ queryParams });

        expect(result.split("&").length).toEqual(queryParams.length);
      });
    });
  });

  describe("when calling execute() method", () => {
    const mockRequest: IRequestExecuterData = {
      resourceType: faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
      resourceName: faker.random.word(),
      method: REQUEST_METHOD,
    };

    it("should pass default params down to the request adapter", async () => {
      const { subject, reqAdapterMock } = createSubject();
      await subject.executeRequest(mockRequest);
      expect(reqAdapterMock.execute).toHaveBeenCalledWith(
        subject.getUrl(mockRequest) + subject.parseQueryParams(mockRequest),
        {
          headers: { Authorization: `Bearer ${validToken}` },
          method: REQUEST_METHOD,
        },
      );
    });

    const actions = [
      { method: RequestMethod.DELETE, hasBody: false },
      { method: RequestMethod.GET, hasBody: false },
      { method: RequestMethod.PATCH, hasBody: true },
      { method: RequestMethod.POST, hasBody: true },
      { method: RequestMethod.PUT, hasBody: true },
    ];

    const withoutBody = actions.filter((action) => !action.hasBody);

    withoutBody.forEach(({ method }) => {
      it(`should pass no body for ${method} requests`, async () => {
        const { subject, reqAdapterMock } = createSubject();
        const request = {
          method,
          body: {},
        };

        await subject.executeRequest(request);

        expect(reqAdapterMock.execute).toHaveBeenCalledWith(
          subject.getUrl(request) + subject.parseQueryParams(request),
          {
            headers: { Authorization: `Bearer ${validToken}` },
            method,
          },
        );
      });
    });

    const withBody = actions.filter((action) => action.hasBody);

    withBody.forEach(({ method }) => {
      it(`should pass body down to the request adapter for ${method} requests`, async () => {
        const { subject, reqAdapterMock } = createSubject();
        const fakeBody = {
          someObject: faker.random.number(),
        };
        const request = {
          method,
          body: fakeBody,
        };
        await subject.executeRequest(request);

        expect(reqAdapterMock.execute).toHaveBeenCalledWith(
          subject.getUrl(request) + subject.parseQueryParams(request),
          {
            headers: { Authorization: `Bearer ${validToken}` },
            body: fakeBody,
            method,
          }
        );
      });
    });

    it("should wait the system initialization before execute the query", async (done) => {
      const defer = deferPromise();
      const { subject, reqAdapterMock } = createSubject({
        clientInit: defer.promise,
      });
      subject.executeRequest({ method: REQUEST_METHOD });
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
        await subject.executeRequest({ method: REQUEST_METHOD });
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
      const mockBody = { method: REQUEST_METHOD, body: {} };
      try {
        await subject.executeRequest(mockBody);
      } catch (err) {
        expect(err.message).toEqual(serverError);
      }
    });
  });
});
