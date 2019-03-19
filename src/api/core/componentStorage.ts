// tslint:disable:max-classes-per-file
import { IAuthToken, Tokens } from "./tokenManager";

/**
 * @internal
 */
export interface IStorageComponent {
  isEmpty(): boolean;

  /**
   * Save token pair into the storage
   * @param auth
   * @param tokens
   * @param defaults
   */
  setTokens(auth: string, tokens: Tokens, defaults: boolean): void;

  /**
   * Return token pair by their alias
   * if alias not provided, returns default pair
   * @param auth {string} Authentication alias
   */
  getTokens(auth?: string): IAuthToken;

  /**
   * Set default token pair
   * @param auth
   */
  setDefault(auth: string): void;

  clear(): Promise<void>;
}

/**
 * @internal
 */
export class WebStorageComponent implements IStorageComponent {

  private readonly defaultKey = '__default_auth__';

  private storage: Storage;

  private get tokens(): IAuthToken[] {
    let result = [];
    for (let i = 0; i < this.storage.length; i++) {
      const auth = this.storage.key(i);
      result.push({
        auth,
        ...JSON.parse(this.storage.getItem(auth as string) as string)
      });
    }
    return result;
  }

  constructor(remember: boolean, window: any) {
    this.storage = remember ? window.localStorage : window.sessionStorage;
  }

  public isEmpty(): boolean {
    return !this.tokens.length;
  }

  public setDefault(auth: string): void {
    this.storage.setItem(this.defaultKey, auth);
  }

  public setTokens(auth: string, tokens: Tokens, defaults: boolean = false) {
    this.storage.setItem(auth, JSON.stringify(tokens));
    if (defaults || this.tokens.length === 1) {
      this.setDefault(auth);
    }
  }

  public getTokens(auth?: string): IAuthToken {
    auth = auth || this.storage.getItem(this.defaultKey) as string;
    return {
      auth,
      ...JSON.parse(this.storage.getItem(auth) as string)
    };
  }

  public clear(): Promise<void> {
    this.storage.removeItem("token");
    this.storage.removeItem("refreshToken");
    return Promise.resolve();
  }
}

/**
 * @internal
 */
export class MemoryStorageComponent implements IStorageComponent {

  private tokens: { [key: string]: Tokens };

  private defaultTokens: string;

  public isEmpty(): boolean {
    return typeof this.tokens === "undefined";
  }

  public setDefault(auth: string): void {
    this.defaultTokens = auth;
  }

  public setTokens(auth: string, tokens: Tokens, defaults: boolean = false): void {
    this.tokens[auth] = tokens;
    if (defaults || Object.keys(this.tokens).length === 1) {
      this.setDefault(auth);
    }
  }

  public getTokens(auth?: string): IAuthToken  {
    auth = auth || this.defaultTokens;
    return { auth, ...this.tokens[auth] };
  }

  public clear(): Promise<void> {
    delete this.tokens;
    return Promise.resolve();
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

  public static setTokens(tokens: IAuthToken): void {
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
