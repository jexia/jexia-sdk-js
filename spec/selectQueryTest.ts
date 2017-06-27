import { Dataset } from "../src/dataset";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
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
  });

  describe("when instantiating a select object from dataset", () => {
    it("should be able to get the select query object", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qef = new QueryExecuterFactory("appUrl", reqAdapterMock, tokenManagerMock);
        let ds = new Dataset("rishabh", "test", qef);
        let query = ds.select();
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a select object from dataset", () => {
    it("should be able to invoke the methods exposed in query", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qef: QueryExecuterFactory = new QueryExecuterFactory("appUrl", reqAdapterMock, tokenManagerMock);
        let ds = new Dataset("rishabh", "test", qef);
        let query = ds.select();
        let queryMethod = query.fields(["rishabh", "jha"]).limit(8).offset(10).filter([
                    {
                        "field": "category_id",
                        "operator": "is_null"
                    },
                    {
                        "type": "and",
                        "conditions": [
                        {
                            "field": "id",
                            "operator": ">",
                            "values": [2]
                        },
                        {
                            "field": "id",
                            "operator": "<",
                            "values": [5]
                        }
                        ]
                    }
                    ]);
        expect(query).toEqual(queryMethod);
        done();
    });
  });

});
