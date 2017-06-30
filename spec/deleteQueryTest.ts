import { DeleteQuery } from "../src/DeleteQuery";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

describe("DeleteQuery class", () => {
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

  describe("when instantiating a deleteQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new DeleteQuery(qe);
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a deleteQuery object from client", () => {
    it("should be able to invoke methods exposed by it", (done) => {
        let qe = qefMock.createQueryExecuter("public","posts");
        let query = new DeleteQuery(qe);
        expect(typeof query.filter).toBe("function");
        expect(typeof query.limit).toBe("function");
        expect(typeof query.offset).toBe("function");
        expect(typeof query.sortAsc).toBe("function");
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a deleteQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        let qe = qefMock.createQueryExecuter("public","posts");
        let queryObj: any = new DeleteQuery(qe).filter([{
                        "field": "id",
                        "operator": "in",
                        "values":[3,4,7,1]
                    }]);
        expect(queryObj.query.conditions).toEqual([{
                        "field": "id",
                        "operator": "in",
                        "values":[3,4,7,1]
                    }]);
        done();
    });
  });

});
