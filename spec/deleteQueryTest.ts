import { TokenManager } from "../src/api/core/tokenManager";
import { DeleteQuery } from "../src/api/dataops/deleteQuery";
import { FilteringCondition } from "../src/api/dataops/filteringCondition";
import { QueryExecuterBuilder } from "../src/internal/queryExecuterBuilder";
import { IRequestAdapter, IRequestOptions } from "../src/internal/requestAdapter";

describe("DeleteQuery class", () => {
  let reqAdapterMock: IRequestAdapter;
  let tokenManagerMock: TokenManager;
  let qefMock: QueryExecuterBuilder;
  let dataset: string;

  beforeAll( () => {
    dataset = "dataset";
    reqAdapterMock = {
      execute(uri: string, opt: IRequestOptions): Promise<any> {
        return Promise.resolve();
      },
    };
    tokenManagerMock = new TokenManager(reqAdapterMock);
    qefMock = new QueryExecuterBuilder("appUrl", reqAdapterMock, tokenManagerMock);
  });

  describe("when instantiating a deleteQuery object directly", () => {
    it("should be able to return required object", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new DeleteQuery(qe, dataset);
        expect(query).toBeDefined();
    });
  });

  describe("when instantiating a deleteQuery object", () => {
    it("should expose the proper methods", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let query = new DeleteQuery(qe, dataset);
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
        let queryObj: any = new DeleteQuery(qe, dataset).filter(cond);
        expect(queryObj).toBeDefined();
        expect(queryObj.request).toBeDefined();
        expect(queryObj.request.Query).toBeDefined();
        expect(queryObj.request.Query.filteringConditions).toEqual(cond);
    });
  });

});
