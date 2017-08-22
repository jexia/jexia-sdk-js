import { RequestExecuter } from "../src/executer";
import { QueryExecuterBuilder } from "../src/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

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
      let executer: RequestExecuter = qef.createQueryExecuter("schemaName", "dataSetName");
      expect(executer).toBeTruthy();
    });
  });
});
