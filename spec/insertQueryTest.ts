import { InsertQuery } from "../src/insertQuery";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";

describe("InsertQuery class", () => {
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

  describe("when instantiating a insertQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new InsertQuery(qe, [{title: "Another first post", user_id: 1}]);
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a insertQuery object from client", () => {
    it("should be able to invoke methods exposed by it", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new InsertQuery(qe, [{title: "Another first post", user_id: 1}]);
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a insertQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        tokenManagerMock = new TokenManager(reqAdapterMock);
        let qe = qefMock.createQueryExecuter("public", "posts");
        let queryObj: any = new InsertQuery(qe, [{title: "Another first post", user_id: 1}]);
        expect(queryObj.query.records).toEqual([{title: "Another first post", user_id: 1}]);
        done();
    });
  });

});
