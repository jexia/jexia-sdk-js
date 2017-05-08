import { QueryRequestAdapter } from "../src/queryRequestAdapter";
import { TokenManager } from "../src/tokenManager";
import { createFetchMockForFailedRequest,
  createFetchMockForSuccesfulAuthRequest,
  createFetchMockForSuccesfulRequest,
  createGenericSuccesfulRequestMock } from "./testUtils";

describe("QueryRequestAdapter class", () => {
  describe("when creating the QueryRequestAdapter", () => {
    let tm: TokenManager;
    let qra: QueryRequestAdapter;

    beforeAll( () => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      tm = new TokenManager("appUrl", fetch);
      fetch = createGenericSuccesfulRequestMock();
      qra = new QueryRequestAdapter(fetch, "appUrl", tm);
    });

    it("should create a valid object", () => {
      expect(qra).toBeDefined();
    });

    it ("doesn't execute the query if the TokenManager did not authenticate beforehand", () => {
      expect( () => qra.executeQuery("schema", "resource", {}))
      .toThrow(new Error("TokenManager does not contain a valid token. Forgot to authenticate?"));
    });
  });

  describe("when executing a succesful query", () => {
    let tm: TokenManager;
    let qra: QueryRequestAdapter;
    let response: any;

    beforeAll( (done) => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      tm = new TokenManager("appUrl", fetch);
      tm.authenticate("key", "secret").then( (tokenManager: TokenManager) => {
        response = { records: [{name: "record1"}, {name: "record2"} ]};
        fetch = createFetchMockForSuccesfulRequest(response);
        qra = new QueryRequestAdapter(fetch, "appUrl", tm);
        done();
      });
    });

    it("returns the requested records only", (done) => {
      qra.executeQuery("schema", "resource", {}).then( (records: Object) => {
        expect(records).toEqual(response);
        done();
      }).catch( (error: Error) => {
        done.fail("Query execution should not have failed.");
      });
    });
  });

  describe("when executing an unsuccesful query", () => {
    let tm: TokenManager;
    let qra: QueryRequestAdapter;
    let errorMessage: string;

    beforeAll( (done) => {
      let fetch: Function = createFetchMockForSuccesfulAuthRequest();
      tm = new TokenManager("appUrl", fetch);
      tm.authenticate("key", "secret").then( (tokenManager: TokenManager) => {
        errorMessage = "Error";
        fetch = createFetchMockForFailedRequest(errorMessage);
        qra = new QueryRequestAdapter(fetch, "appUrl", tokenManager);
        done();
      });
    });

    it("doesn't swallow exceptions coming from the HTTP request module", (done) => {
      qra.executeQuery("schema", "resource", {}).then( (records: Object) => {
        done.fail("Query execution should have failed.");
      }).catch( (error: Error) => {
        expect(error.message).toEqual(errorMessage);
        done();
      });
    });
  });
});
