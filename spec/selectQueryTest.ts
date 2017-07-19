import { FilteringCondition } from "../src/filteringCondition";
import { QueryExecuterFactory } from "../src/queryExecuterFactory";
import { IRequestAdapter, IRequestOptions } from "../src/requestAdapter";
import { SelectQuery } from "../src/selectQuery";
import { TokenManager } from "../src/tokenManager";

describe("SelectQuery class", () => {
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

  describe("when instantiating a select object", () => {
    it("should be able to get the select query object", () => {
        let query: SelectQuery = new SelectQuery(qefMock.createQueryExecuter("schema", "dataSet"));
        expect(query).toBeDefined();
    });
  });

  describe("when instantiating a select query object", () => {
    it("should expose the proper methods", () => {
        let query: SelectQuery = new SelectQuery(qefMock.createQueryExecuter("schema", "dataSet"));
        expect(typeof(query.execute)).toBe("function");
        expect(typeof(query.fields)).toBe("function");
        expect(typeof(query.filter)).toBe("function");
        expect(typeof(query.limit)).toBe("function");
        expect(typeof(query.offset)).toBe("function");
        expect(typeof(query.sortAsc)).toBe("function");
        expect(typeof(query.sortDesc)).toBe("function");
    });
  });

  describe("when configuring a select query object", () => {
    it("it should have the correct query options set", () => {
        let qe = qefMock.createQueryExecuter("public", "posts");
        let cond = new FilteringCondition("field", "operator", "value");
        let queryObj: any = new SelectQuery(qe).filter(cond).limit(2).sortAsc("updated_at");
        expect(queryObj.query.filteringConditions).toEqual(cond);
        expect(queryObj.query.limit).toEqual(2);
        expect(queryObj.query.orders).toEqual([{fields: ["updated_at"], direction: "asc"}]);
    });
  });
});
