import { FilteringCondition } from "../src/filteringCondition";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { TokenManager } from "../src/tokenManager";
import { UpdateQuery } from "../src/UpdateQuery";

describe("UpdateQuery class", () => {
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

  describe("when instantiating a updateQuery object directly", () => {
    it("should be able to return required object", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new UpdateQuery(qe, {title: "changed first field"});
        expect(query).toBeDefined();
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {
    it("should expose the proper methods", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new UpdateQuery(qe, { title: "changed first field"});
        expect(typeof query.filter).toBe("function");
        expect(typeof query.limit).toBe("function");
        expect(typeof query.offset).toBe("function");
        expect(typeof query.sortAsc).toBe("function");
        expect(typeof query.execute).toBe("function");
        done();
    });
  });

  describe("when instantiating a updateQuery object from client", () => {
    it("its query object should have desired properties", (done) => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let queryObj: any = new UpdateQuery(qe, {title: "changed first field"})
        .filter(new FilteringCondition("field", "operator", "value")).limit(2);
        expect(queryObj.query.data).toEqual({ title: "changed first field" });
        expect(queryObj.query.limit).toEqual(2);
        done();
    });
  });

});
