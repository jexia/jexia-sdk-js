import { RequestExecuter } from "../src/internal/executer";
import { IRequestAdapter, IRequestOptions, Methods } from "../src/internal/requestAdapter";

describe("QueryExecuter class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: any;
  const validToken = "valid_token";
  const dataset = "dataset";
  const url = "appurl";
  const queryUrl = `http://${url}:8080/sdk-api/${dataset}`;

  beforeAll( () => {
    tokenManagerMock = {
      get token(): Promise<string> {
        return Promise.resolve(validToken);
      },
    };
  });

  describe("when creating the QueryExecuter", () => {
    beforeEach(() => {
      reqAdapterMock = {
        execute(uri: string, opt: IRequestOptions): Promise<any> {
          return Promise.resolve();
        },
      };
    });

    it("should create a valid object", () => {
      let qe = new RequestExecuter(url, dataset, reqAdapterMock, tokenManagerMock);
      expect(qe).toBeTruthy();
    });
  });

  describe("when calling the execute() method", () => {
    it("should pass the proper options down to the request adapter", (done) => {
      reqAdapterMock = {
        execute(uri: string, opt: IRequestOptions): Promise<any> {
          return Promise.resolve();
        },
      };
      const mockBody = {action: "action"};
      spyOn(reqAdapterMock, "execute");
      let qe = new RequestExecuter(url, dataset, reqAdapterMock, tokenManagerMock);
      qe.executeRequest(mockBody).then( () => {
        expect(reqAdapterMock.execute).toHaveBeenCalledWith(queryUrl,
        {headers: { Authorization: validToken}, body: mockBody, method: Methods.POST });
        done();
      });
    });

    it("should throw server errors back to the caller", (done) => {
      const serverError = "Server error";
      reqAdapterMock = {
        execute(uri: string, opt: IRequestOptions): Promise<any> {
          return Promise.reject(new Error(serverError));
        },
      };
      const mockBody = {action: "select", params: {} };
      let qe = new RequestExecuter(url, dataset, reqAdapterMock, tokenManagerMock);
      qe.executeRequest(mockBody).then( () => {
        done.fail("request should have failed");
      }).catch( (err: Error) => {
        expect(err.message).toEqual(serverError);
        done();
      });
    });
  });
});
