import { Dataset } from "../src/dataset";
import { QueryExecuterBuilder } from "../src/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

describe("Dataset class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: TokenManager;

  beforeAll( () => {
    reqAdapterMock = {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    };
    tokenManagerMock = new TokenManager(reqAdapterMock);
    /* replace request adapter with mock */
  });

  describe("when instantiating a dataset object directly", () => {
    it("should create a valid object", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qef: QueryExecuterBuilder = new QueryExecuterBuilder("appUrl", reqAdapterMock, tokenManagerMock);
        let ds = new Dataset("rishabh", "test", qef);
        expect(ds).toBeDefined();
        done();
    });
  });

  describe("when instantiating a dataset object directly", () => {
    it("should be able to call required methods on dataset", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qef: QueryExecuterBuilder = new QueryExecuterBuilder("appUrl", reqAdapterMock, tokenManagerMock);
        let ds = new Dataset("rishabh", "test", qef);
        let query = ds.select();
        expect(query).toBeDefined();
        done();
    });
  });

});
