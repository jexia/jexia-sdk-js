// tslint:disable:no-string-literal
import {
  MemoryStorageComponent,
  TokenStorage,
  WebStorageComponent,
} from "../src/api/core/componentStorage";

import { IAuthToken } from "../src/api/core/tokenManager";

class WebStorageApiMock {
  private dictionary: any = {};

  public setItem(item: string, value: string): void {
    this.dictionary[item] = value.toString();
  }

  public getItem(item: string): void {
    return this.dictionary[item];
  }

  public removeItem(item: string): void {
    this.dictionary[item] = null;
  }
}

const token = <IAuthToken> {
  refreshToken: "validRefreshToken",
  token: "validToken",
};

describe("ComponentStorage", ()  => {
  const components = ["MemoryStorageComponent", "WebStorageComponent"];
  components.forEach((component) => {
    describe(component, () => {
      let instanceComponent: WebStorageComponent | MemoryStorageComponent;
      let savedTokens: Promise<any>;
      const errorSettingTokens = (done: jest.DoneCallback) => {
        return () => done.fail("setting tokens should not fail");
      };

      beforeAll(() => {
        if (component === "MemoryStorageComponent") {
          instanceComponent = new MemoryStorageComponent();
        } else {
          instanceComponent = new WebStorageComponent(true, {
            localStorage: new WebStorageApiMock(),
            sessionStorage: new WebStorageApiMock(),
          });
        }
        savedTokens = instanceComponent.setTokens(token);
      });

      it("should return the expected saved token", (done) => {
         savedTokens
          .then(() => {
            return instanceComponent.getTokens();
          })
          .then((tokens: IAuthToken) => {
            expect(tokens).toEqual(Object.assign({}, tokens));
            done();
          })
          .catch(errorSettingTokens(done));
      });

      it("should clear the saved tokens", async () => {
        await instanceComponent.clear();
        expect(instanceComponent.isEmpty()).toBe(true);
      });

      it("should be empty if there is no token", async () => {
        spyOn(instanceComponent as any, "getToken").and.returnValue({
          refreshToken: "testRefreshToken",
        });
        expect(instanceComponent.isEmpty()).toBe(true);
      });

      it("should be empty if there is no refreshToken", async () => {
        spyOn(instanceComponent as any, "getToken").and.returnValue({
          token: "testToken",
        });
        expect(instanceComponent.isEmpty()).toBe(true);
      });
    });
  });

  describe("WebStorageComponent specific functionality", () => {
    let sessionStorageMock: any;
    let localStorageMock: any;

    beforeAll(() => {
      sessionStorageMock = new WebStorageApiMock();
      localStorageMock = new WebStorageApiMock();
    });

    it("should use localStorage when the class is instantiated with true", (done) => {
      const webStorageComponent = new WebStorageComponent(true, {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
      });
      spyOn(localStorageMock, "setItem");
      webStorageComponent
        .setTokens(token)
        .then(() => {
          expect(localStorageMock.setItem.calls.count()).toBe(2);
          expect(localStorageMock.setItem).toHaveBeenCalledWith("token", token.token);
          expect(localStorageMock.setItem).toHaveBeenCalledWith("refreshToken", token.refreshToken);
          done();
        })
        .catch(() => done.fail("setting tokens should not fail"));
    });
  });

  describe("TokenStorage", () => {
    beforeAll(() => {
      TokenStorage.cleanStorage();
    });

    it("should use MemoryStorage as default", () => {
      expect(TokenStorage.getStorageAPI() instanceof MemoryStorageComponent).toBeTruthy();
    });

    it("should be able to change the storage API", () => {
      const webStorage = new WebStorageComponent(true, {
        localStorage: {},
        sessionStorage: {},
      });
      TokenStorage.setStorageAPI(webStorage);
      expect(TokenStorage.getStorageAPI()).toEqual(webStorage);
    });

    it("should use localStorage to remember the storage", () => {
      const storageTypes = {
        localStorage: {},
        sessionStorage: {},
      };
      const webStorage = new WebStorageComponent(true, storageTypes);
      expect(webStorage["storage"]).toBe(storageTypes.localStorage);
    });

    it("should use sessionStorage when it is not to remember the storage", () => {
      const storageTypes = {
        localStorage: {},
        sessionStorage: {},
      };
      const webStorage = new WebStorageComponent(false, storageTypes);
      expect(webStorage["storage"]).toBe(storageTypes.sessionStorage);
    });

    it("should set new tokens", (done) => {
      const memoryStorageComponent = new MemoryStorageComponent();
      TokenStorage.setStorageAPI(memoryStorageComponent);
      TokenStorage
        .setTokens(token)
        .then(() => {
          return TokenStorage.getStorageAPI().getTokens();
        })
        .then((newTokens) => {
          expect(newTokens).toEqual(token);
          done();
        })
        .catch(() => done.fail("setting new tokens should now fail"));
    });

    it("should throw an error when trying to use a new instance when there is an storage", () => {
      expect(() => new TokenStorage()).toThrowError();
    });

    it("should have a storage by default", () => {
      expect(TokenStorage["storage"]).toBeInstanceOf(MemoryStorageComponent);
    });

    it("should create a storage when creating a new instance without one", () => {
      (TokenStorage as any).storage = null;
      // tslint:disable-next-line:no-unused-new
      new TokenStorage();
      expect(TokenStorage["storage"]).toBeInstanceOf(MemoryStorageComponent);
    });
  });

  afterAll(() => {
    TokenStorage.setStorageAPI(new MemoryStorageComponent());
  });
});
