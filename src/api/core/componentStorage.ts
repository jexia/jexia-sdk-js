// tslint:disable:max-classes-per-file
import { Tokens } from "./tokenManager";

/**
 * @internal
 */
export interface IStorageComponent {
  isEmpty(): boolean;

  /**
   * Save token pair into the storage
   * @param auth {string} Alias for the token pair
   * @param tokens {Tokens} Token pair to save
   * @param defaults {boolean} Use this token pair by default if true
   */
  setTokens(auth: string, tokens: Tokens, defaults: boolean): void;
  setTokens(auth: string, tokens: Tokens): void;

  /**
   * Return token pair by their alias
   * if alias not provided, returns the default pair
   * @param auth {string} Authentication alias
   */
  getTokens(auth?: string): Tokens;

  /**
   * Set default token pair
   * @param auth
   */
  setDefault(auth: string): void;

  /**
   * Remove
   */
  clear(): void;
}

/**
 * @internal
 */
export class WebStorageComponent implements IStorageComponent {
  private readonly storageKey = '__jexia_tokens__';
  private readonly defaultKey = '__default_auth__';

  private storage: Storage;

  /* get all tokens from the storage */
  private get tokens(): {[auth: string]: Tokens} {
    let tokens;
    try {
      tokens = JSON.parse(this.storage.getItem(this.storageKey) as string);
    } catch {
      tokens = {};
    }
    return tokens || {};
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
    let storedTokens = this.tokens;
    storedTokens[auth] = tokens;

    this.storage.setItem(this.storageKey, JSON.stringify(storedTokens));

    if (defaults || Object.keys(storedTokens).length === 1) {
      this.setDefault(auth);
    }
  }

  public getTokens(auth?: string): Tokens {
    auth = auth || this.storage.getItem(this.defaultKey) as string;
    return this.tokens[auth];
  }

  public clear(): void {
    this.storage.removeItem(this.storageKey);
  }
}

/**
 * @internal
 */
export class MemoryStorageComponent implements IStorageComponent {

  private tokens: { [auth: string]: Tokens } = {};

  private defaultTokens: string;

  public isEmpty(): boolean {
    return !Object.keys(this.tokens).length;
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

  public getTokens(auth?: string): Tokens  {
    auth = auth || this.defaultTokens;
    return this.tokens[auth];
  }

  public clear(): void {
    this.tokens = {};
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

  private static storage: IStorageComponent = new MemoryStorageComponent();

  constructor() {
    if (TokenStorage.storage) {
      throw new Error("Use TokenStorage.getStorageAPI() instead of new");
    } else {
      TokenStorage.storage = new MemoryStorageComponent();
    }
  }
}
