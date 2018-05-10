// tslint:disable:max-classes-per-file
import { IAuthToken } from "./tokenManager";

/**
 * @internal
 */
export interface IStorageComponent {
  isEmpty(): boolean;
  setTokens(tokens: IAuthToken): Promise<IAuthToken>;
  getTokens(): Promise<IAuthToken>;
  clear(): Promise<void>;
}

/**
 * @internal
 */
export class WebStorageComponent implements IStorageComponent {

  private storage: Storage;

  constructor(remember: boolean, window: any) {
    this.storage = remember ? window.localStorage : window.sessionStorage;
  }

  public isEmpty(): boolean {
    const tokens = this.getToken();
    return (tokens.token === null || tokens.refreshToken === null);
  }

  public setTokens(tokens: IAuthToken): Promise<IAuthToken> {
    this.storage.setItem("token", tokens.token);
    this.storage.setItem("refreshToken", tokens.refreshToken);
    return Promise.resolve(this.getToken());
  }

  public getTokens(): Promise<IAuthToken>  {
    return Promise.resolve(this.getToken());
  }

  public clear(): Promise<void> {
    this.storage.removeItem("token");
    this.storage.removeItem("refreshToken");
    return Promise.resolve();
  }

  private getToken(): IAuthToken {
    return <IAuthToken> {
      refreshToken: this.storage.getItem("refreshToken"),
      token: this.storage.getItem("token"),
    };
  }
}

/**
 * @internal
 */
export class MemoryStorageComponent implements IStorageComponent {

  private tokens: IAuthToken;

  public isEmpty(): boolean {
    return typeof this.tokens === "undefined";
  }

  public setTokens(tokens: IAuthToken): Promise<IAuthToken> {
    this.tokens = tokens;
    return Promise.resolve(this.getToken());
  }

  public getTokens(): Promise<IAuthToken>  {
    return Promise.resolve(this.getToken());
  }

  public clear(): Promise<void> {
    delete this.tokens;
    return Promise.resolve();
  }

  private getToken(): IAuthToken {
    return this.tokens;
  }
}

/**
 * @internal
 */
export class TokenStorage {
  public static getStorageAPI(): IStorageComponent {
    return TokenStorage.storage;
  }

  public static setStorageAPI(storage: IStorageComponent) {
    TokenStorage.storage = storage;
  }

  public static cleanStorage() {
    TokenStorage.storage.clear();
  }

  public static setTokens(tokens: IAuthToken): Promise<IAuthToken> {
    return TokenStorage.storage.setTokens(tokens);
  }

  private static storage: IStorageComponent = new MemoryStorageComponent();

  constructor() {
    if (TokenStorage.storage) {
      throw new Error("Use TokenStorage.getStorageAPI() instead of new");
    } else {
      TokenStorage.storage = new MemoryStorageComponent();
    }
  }
}
