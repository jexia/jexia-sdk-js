// tslint:disable:no-string-literal
// @ts-ignore
import * as faker from 'faker';
import {
  MemoryStorageComponent,
  TokenStorage,
  WebStorageComponent,
} from "./componentStorage";

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

const generateTokens = () => ({
  refresh_token: faker.random.uuid(),
  token: faker.random.uuid(),
});

describe("ComponentStorage", ()  => {
  const components = ["MemoryStorageComponent", "WebStorageComponent"];
  components.forEach((component) => {
    describe(component, () => {
      let instanceComponent: WebStorageComponent | MemoryStorageComponent;
      const tokenOne = generateTokens();
      const tokenTwo = generateTokens();

      beforeAll(() => {
        if (component === "MemoryStorageComponent") {
          instanceComponent = new MemoryStorageComponent();
        } else {
          instanceComponent = new WebStorageComponent(true, {
            localStorage: new WebStorageApiMock(),
            sessionStorage: new WebStorageApiMock(),
          });
        }
      });

      it("should return the expected saved token pair by alias", () => {
        instanceComponent.setTokens('testAlias', tokenOne);
        expect(instanceComponent.getTokens('testAlias')).toEqual(tokenOne);
      });

      it("should return default token if there is only one", () => {
        expect(instanceComponent.getTokens()).toEqual(tokenOne);
      });

      it("should save second token", () => {
        instanceComponent.setTokens('anotherAlias', tokenTwo);
        expect(instanceComponent.getTokens('anotherAlias')).toEqual(tokenTwo);
      });

      it("should return first token by default", () => {
        expect(instanceComponent.getTokens()).toEqual(tokenOne);
      });

      it("should set default token and return it", () => {
        instanceComponent.setDefault('anotherAlias');
        expect(instanceComponent.getTokens()).toEqual(tokenTwo);
      });

      it("should add token with default flag and return it by default", () => {
        const tokens = generateTokens();
        instanceComponent.setTokens('defaultTokens', tokens, true);
        expect(instanceComponent.getTokens()).toEqual(tokens);
      });

      it("should clear the saved tokens", () => {
        instanceComponent.clear();
        expect(instanceComponent.isEmpty()).toBeTruthy();
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

    it("should use localStorage when the class is instantiated with true", () => {
      const webStorageComponent = new WebStorageComponent(true, {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock,
      });
      const tokens = generateTokens();
      spyOn(localStorageMock, "setItem");
      webStorageComponent.setTokens('alias', tokens);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "__jexia_tokens__",
        JSON.stringify({ alias: tokens })
      );
    });
  });

  describe("TokenStorage", () => {
    beforeAll(() => {
      TokenStorage.getStorageAPI().clear();
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

    it("should throw an error when trying to use a new instance when there is an storage", () => {
      expect(() => new TokenStorage()).toThrowError();
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
