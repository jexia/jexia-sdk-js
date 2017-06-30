import { Dataset } from "../src/dataset";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";
import { SelectQuery } from "../src/selectQuery";

describe("Dataset class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: TokenManager;
  let qefMock: QueryExecuterFactory;

  beforeAll( () => {
    reqAdapterMock = {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    };
    tokenManagerMock = new TokenManager(reqAdapterMock);
    qefMock = new QueryExecuterFactory("appUrl", reqAdapterMock, tokenManagerMock);
  });

  describe("when instantiating a select object from dataset", () => {
    it("should be able to get the select query object", (done) => {
        let ds = new Dataset("rishabh", "test", qefMock);
        let query = ds.select();
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a select object from dataset", () => {
    it("should be able to invoke the methods exposed in query", (done) => {
        let ds = new Dataset("rishabh", "test", qefMock);
        let query = ds.select();
        let queryMethod = query.fields("rishabh", "jha").limit(8).offset(10).filter([
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

  describe("when instantiating a selectQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let queryObj: any = new SelectQuery(qe).filter([{
                        field: "id",
                        operator: "in",
                        values:[3, 4, 7, 1]
                    }]).limit(2).sortAsc("updated_at");
        expect(queryObj.query.conditions).toEqual([{
                        field: "id",
                        operator: "in",
                        values:[3, 4, 7, 1]
                    }]);
        expect(queryObj.query.limit).toEqual(2);
        expect(queryObj.query.orders).toEqual([{fields: ["updated_at"], direction: "asc"}]);
        done();
    });
  });

});
