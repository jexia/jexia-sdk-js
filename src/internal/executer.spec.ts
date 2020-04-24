import * as faker from "faker";
import { of } from "rxjs";
import { switchMap } from "rxjs/operators";
import {
  getRandomRequestMethod,
  getRandomResourceType,
  requestAdapterMockFactory,
} from "../../spec/testUtils";
import { ResourceType } from "../api/core/resource";
import { TokenManager } from "../api/core/tokenManager";
import { API } from "../config/config";
import { RequestExecuter } from "./executer";
import { IRequestExecuterData } from "./executer.interfaces";
import { IRequestOptions, RequestAdapter, RequestMethod } from "./requestAdapter";
import { deferPromise } from "./utils";

describe("QueryExecuter class", () => {
  const validToken = faker.random.alphaNumeric();
  const projectID = faker.random.uuid();
  const restDatasetUrl = (resourceName: string) => `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
    `:${API.PORT}/${API.DATA.ENDPOINT}/${resourceName}`;
  const restFilesetUrl = (resourceName: string) => `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}` +
    `:${API.PORT}/${API.FILES.ENDPOINT}/${resourceName}`;

  const createSubject = ({
    reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution(),
    clientInit = Promise.resolve(),
    tokenManagerMock = {
      token() {
        return of(validToken);
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
    let requestData: IRequestExecuterData;
    let reqAdapterMock: RequestAdapter;

    describe("executeRequest method", () => {
      beforeEach(() => {
        reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
        subject = createSubject({ reqAdapterMock }).subject;
        requestData = {
          resourceType: getRandomResourceType(),
          method: getRandomRequestMethod(),
          resourceName: faker.random.word(),
        };
      });

      it("should get URL", (done) => {
        spyOn(subject, "getUrl").and.callThrough();
        subject.executeRequest(requestData).subscribe(() => {
          expect(subject.getUrl).toHaveBeenCalledWith(requestData);
          done();
        },
          done,
          done,
        );
      });

      it("should parse query params", (done) => {
        spyOn(subject, "parseQueryParams").and.callThrough();
        subject.executeRequest(requestData).subscribe(() => {
          expect(subject.parseQueryParams).toHaveBeenCalledWith(requestData);
          done();
        },
          done,
          done,
        );
      });

      it("should get request options", (done) => {
        spyOn(subject, "getRequestOptions").and.callThrough();
        subject.executeRequest(requestData).subscribe(() => {
          expect(subject.getRequestOptions).toHaveBeenCalledWith(requestData);
          done();
        },
          done,
          done,
        );
      });

      it("should make a request with proper URL, params and options", (done) => {
        let requestOptions: IRequestOptions;

        subject.getRequestOptions(requestData).pipe(
          switchMap((options: IRequestOptions) => {
            requestOptions = options;
            return subject.executeRequest(requestData)
          }),
        ).subscribe({
          complete: () => {
            expect(reqAdapterMock.execute).toHaveBeenCalledWith(
              subject.getUrl(requestData) + subject.parseQueryParams(requestData),
              requestOptions,
            );
            done();
          }
        });
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
      resourceType: getRandomResourceType(),
      resourceName: faker.random.word(),
      method: getRandomRequestMethod(),
    };

    it("should pass default params down to the request adapter", (done) => {
      const { subject, reqAdapterMock } = createSubject();
      subject.executeRequest(mockRequest).subscribe({
        complete: () => {
          expect(reqAdapterMock.execute).toHaveBeenCalledWith(
            subject.getUrl(mockRequest) + subject.parseQueryParams(mockRequest),
            {
              headers: { Authorization: `Bearer ${validToken}` },
              method: mockRequest.method,
            },
          );
          done();
        },
      });
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
      it(`should pass no body for ${method} requests`, (done) => {
        const { subject, reqAdapterMock } = createSubject();
        const request = {
          method,
          body: {},
        };

        subject.executeRequest(request).subscribe({ complete: () => {
          expect(reqAdapterMock.execute).toHaveBeenCalledWith(
            subject.getUrl(request) + subject.parseQueryParams(request),
            {
              headers: { Authorization: `Bearer ${validToken}` },
              method,
            },
          );
          done();
        }});
      });
    });

    const withBody = actions.filter((action) => action.hasBody);

    withBody.forEach(({ method }) => {
      it(`should pass body down to the request adapter for ${method} requests`,  (done) => {
        const { subject, reqAdapterMock } = createSubject();
        const fakeBody = {
          someObject: faker.random.number(),
        };
        const request = {
          method,
          body: fakeBody,
        };

        subject.executeRequest(request).subscribe({
          complete: () => {
            expect(reqAdapterMock.execute).toHaveBeenCalledWith(
              subject.getUrl(request) + subject.parseQueryParams(request),
              {
                headers: {Authorization: `Bearer ${validToken}`},
                body: fakeBody,
                method,
              }
            );
            done();
          }
        });
      });
    });

    it("should wait the system initialization before execute the query", (done) => {
      const defer = deferPromise();
      const { subject, reqAdapterMock } = createSubject({
        clientInit: defer.promise,
      });
      subject.executeRequest({ method: mockRequest.method }).subscribe();
      setTimeout(() => {
        expect(reqAdapterMock.execute).not.toHaveBeenCalled();
        done();
      });
    });

    it("should not execute the query if there is an error on system initialization", () => {
      const initError = "system initialization error";
      const { subject, reqAdapterMock } = createSubject({
        clientInit: Promise.reject(initError),
      });

      subject.executeRequest({ method: mockRequest.method }).subscribe({
        error: ({ message }: Error) => expect(message).toEqual(initError),
      });

      expect(reqAdapterMock.execute).not.toHaveBeenCalled();
    });

    it("should throw server errors back to the caller",(done) => {
      const serverError = "Server error";
      const { subject } = createSubject({
        reqAdapterMock: requestAdapterMockFactory().failedExecution(serverError)
      });
      const mockBody = { method: mockRequest.method, body: {} };

      subject.executeRequest(mockBody).subscribe(
        () => done("request has been successfully executed"),
        (err: any) => {
          expect(err.message).toEqual(serverError);
          done();
        },
      );
    });
  });
});
