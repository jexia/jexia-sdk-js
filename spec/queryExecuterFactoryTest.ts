import { TokenManager } from "../src/api/core/tokenManager";
import { RequestExecuter } from "../src/internal/executer";
import { QueryExecuterBuilder } from "../src/internal/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";

describe("QueryExecuterFactory class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: TokenManager;

  beforeAll(() => {
    reqAdapterMock = {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    };
    tokenManagerMock = new TokenManager(reqAdapterMock);
  });

  describe("when creating the QueryExecuterFactory", () => {
    it("should create a valid object", () => {
      let qef = new QueryExecuterBuilder("appUrl", reqAdapterMock, tokenManagerMock);
      expect(qef).toBeTruthy();
    });
  });

  describe("when calling the createQueryExecuter() method", () => {
    it("should create a valid object", () => {
      let qef: QueryExecuterBuilder = new QueryExecuterBuilder("appUrl", reqAdapterMock, tokenManagerMock);
      let executer: RequestExecuter = qef.createQueryExecuter("dataSetName");
      expect(executer).toBeTruthy();
    });
  });
});
