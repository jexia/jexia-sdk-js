import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { QueryExecuter } from "../src/queryExecuter";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

describe("QueryExecuterFactory class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: TokenManager;

  beforeAll( () => {
    reqAdapterMock = {
      execute(uri: string, opt: IRequestOptions): Promise<any>{
        return Promise.resolve();
      },
    };
    tokenManagerMock = new TokenManager(reqAdapterMock);
  });

  describe("when creating the QueryExecuterFactory", () => {
    it("should create a valid object", () => {
      let qef = new QueryExecuterFactory("appUrl", reqAdapterMock, tokenManagerMock);
      expect(qef).toBeTruthy();
    });
  });

  describe("when calling the createQueryExecuter() method", () => {
    it("should create a valid object", () => {
      let qef: QueryExecuterFactory = new QueryExecuterFactory("appUrl", reqAdapterMock, tokenManagerMock);
      let executer: QueryExecuter = qef.createQueryExecuter("dataSetName", "schemaName");
      expect(executer).toBeTruthy();
    });
  });
});
