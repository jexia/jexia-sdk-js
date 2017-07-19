import { DeleteQuery } from "../src/DeleteQuery";
import { FilteringCondition } from "../src/filteringCondition";
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
    it("should be able to return required object", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new DeleteQuery(qe);
        expect(query).toBeDefined();
    });
  });

  describe("when instantiating a deleteQuery object", () => {
    it("should expose the proper methods", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new DeleteQuery(qe);
        expect(typeof query.filter).toBe("function");
        expect(typeof query.limit).toBe("function");
        expect(typeof query.offset).toBe("function");
        expect(typeof query.sortAsc).toBe("function");
        expect(typeof query.execute).toBe("function");
    });
  });

  describe("when configuring a deleteQuery object", () => {
    it("its query object should have the correct query options set", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let cond = new FilteringCondition("field", "operator", "value");
        let queryObj: any = new DeleteQuery(qe).filter(cond);
        expect(queryObj.query.filteringConditions).toEqual(cond);
    });
  });

});
