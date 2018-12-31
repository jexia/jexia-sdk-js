import { requestAdapterMockFactory } from "../../spec/testUtils";
import { API } from "../config/config";
import { RequestExecuter } from "./executer";
import { Methods, RequestAdapter } from "./requestAdapter";
import { deferPromise } from "./utils";

describe("QueryExecuter class", () => {
  let reqAdapterMock: RequestAdapter;
  let tokenManagerMock: any;
  let clientInit: Promise<any>;
  const validToken = "valid_token";
  const dataset = "dataset";
  const projectID = "projectID";
  const restUrl = `${API.PROTOCOL}://${projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}` +
    `/${API.DATA.ENDPOINT}/${dataset}`;

  beforeAll( () => {
    clientInit = Promise.resolve();
    tokenManagerMock = {
      get token(): Promise<string> {
        return Promise.resolve(validToken);
      },
    };
  });

  describe("when creating the QueryExecuter", () => {
    beforeEach(() => {
      reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
    });

    it("should create a valid object", () => {
      const re = new RequestExecuter({ projectID } as any, dataset, clientInit, reqAdapterMock, tokenManagerMock);
      expect(re).toBeTruthy();
    });
  });

  describe("getRequestUrl method", () => {
    let executor: RequestExecuter;
    beforeEach(() => {
      executor = new RequestExecuter({ projectID } as any, dataset, clientInit, reqAdapterMock, tokenManagerMock);
    });
    it("should use rest api endpoint for the rest request", () => {
      const url = (executor as any).getUrl();
      expect(url).toEqual(restUrl);
    });
  });

  describe("when calling", () => {
    it("executeRestMethod() should call getUrl() method", (done) => {
      reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
      const re: any = new RequestExecuter({ projectID } as any, dataset, clientInit, reqAdapterMock, tokenManagerMock);
      spyOn(re, "getUrl");
      re.executeRequest([]);
      setTimeout(() => {
        expect(re.getUrl).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe("when calling the execute() method", () => {
    it("should pass the proper options down to the request adapter", async () => {
      reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
      const mockBody = {action: "action"};
      const re = new RequestExecuter({ projectID } as any, dataset, clientInit, reqAdapterMock, tokenManagerMock);
      await re.executeRequest(mockBody);
      expect(reqAdapterMock.execute).toHaveBeenCalledWith(restUrl,
        { headers: { Authorization: `Bearer ${validToken}` }, body: mockBody, method: Methods.POST });
    });

    it("should wait the system initialization before execute the query", (done) => {
      const defer = deferPromise();
      reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
      const re = new RequestExecuter({} as any, dataset, defer.promise, reqAdapterMock, tokenManagerMock);
      re.executeRequest({ action: "action" });
      setTimeout(() => {
        expect(reqAdapterMock.execute).not.toHaveBeenCalled();
        done();
      });
    });

    it("should not execute the query if there is an error on system initialization", async () => {
      const initError = "system initialization error";
      reqAdapterMock = requestAdapterMockFactory().genericSuccesfulExecution();
      const re = new RequestExecuter({} as any, dataset, Promise.reject(initError), reqAdapterMock, tokenManagerMock);
      try {
        await re.executeRequest({ action: "action" });
        throw new Error("request execution should have throw an error");
      } catch (error) {
        expect(error).toBe(initError);
      } finally {
        expect(reqAdapterMock.execute).not.toHaveBeenCalled();
      }
    });

    it("should throw server errors back to the caller", (done) => {
      const serverError = "Server error";
      reqAdapterMock = requestAdapterMockFactory().failedExecution(serverError);
      const mockBody = {action: "select", params: {} };
      const re = new RequestExecuter({ projectID } as any, dataset, clientInit, reqAdapterMock, tokenManagerMock);
      re.executeRequest(mockBody).then( () => {
        done.fail("request should have failed");
      }).catch( (err: Error) => {
        expect(err.message).toEqual(serverError);
        done();
      });
    });
  });
});
