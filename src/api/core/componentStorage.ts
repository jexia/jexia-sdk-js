// tslint:disable:max-classes-per-file
import { Tokens } from "./tokenManager";
import { APIKEY_DEFAULT_ALIAS } from "../../config";

/**
 * fetch an array of all aliases for one access token
 * @internal
 */
export const getAliases = (accessToken: string, tokens: tokenList): string[] => Object.entries(tokens)
  .filter(([, token]) => token.access_token === accessToken)
  .map(([alias]) => alias);

/**
 * @internal
 */
export type tokenList = {[auth: string]: Tokens}

/**
 * @internal
 */
export interface IStorageComponent {
  /**
   * Holds the default key/alias
   */
  defaultAuthAlias: string

  isEmpty(): boolean;

  /**
   * Save token pair into the storage
   * @param auth {string} Alias for the token pair
   * @param tokens {Tokens} Token pair to save
   * @param defaults {boolean} Use this token pair by default if true
   */
  setTokens(auth: string, tokens: Tokens, defaults?: boolean): void;

  /**
   * Return token pair by their alias
   * if alias not provided, returns the default pair
   * @param auth {string} Authentication alias or user email
   */
  getTokens(auth?: string): Tokens;

  /**
   * Set default token pair
   * @param auth
   */
  setDefault(auth: string): void;

  /**
   * clear / Remove a token with a specific key
   *
   * @param alias
   */
  removeTokens(alias: string): void;

  /**
   * Remove
   */
  clear(): void;

  /**
   * Get all aliases per accessToken
   */
  getTokenAliases(accessToken: string): string[];
}

/**
 * @internal
 */
export class WebStorageComponent implements IStorageComponent {
  private readonly storageKey = "__jexia_tokens__";
  private readonly defaultKey = "__default_auth__";

  private storage: Storage;

  public get defaultAuthAlias(): string {
    return this.storage.getItem(this.defaultKey) || "";
  }

  /* get all tokens from the storage */
  private get tokens(): tokenList {
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
    const storedTokens = this.tokens;
    storedTokens[auth] = tokens;

    this.storage.setItem(this.storageKey, JSON.stringify(storedTokens));

    if (defaults || Object.keys(storedTokens).length === 1) {
      this.setDefault(auth);
    }
  }

  public getTokens(auth?: string): Tokens {
    auth = auth || this.defaultAuthAlias;
    return this.tokens[auth];
  }

  public removeTokens(alias: string): void {
    const storedTokens = this.tokens;

    // no key found, bail out
    if (!storedTokens[alias]) { return; }

    // fetch and delete all aliases
    const aliases = this.getTokenAliases(storedTokens[alias].access_token);
    aliases.forEach(key => delete storedTokens[key]);

    this.storage.setItem(this.storageKey, JSON.stringify(storedTokens));

    // reset to default if needed
    if(alias === this.storage.getItem(this.defaultKey)) {
      this.setDefault(APIKEY_DEFAULT_ALIAS);
    }
  }

  public clear(): void {
    this.storage.removeItem(this.storageKey);
  }

  public getTokenAliases(accessToken: string): string[] {
    return getAliases(accessToken, this.tokens)
  }
}

/**
 * @internal
 */
export class MemoryStorageComponent implements IStorageComponent {

  private tokens: tokenList = {};

  public defaultAuthAlias: string;

  public isEmpty(): boolean {
    return !Object.keys(this.tokens).length;
  }

  public setDefault(auth: string): void {
    this.defaultAuthAlias = auth;
  }

  public setTokens(auth: string, tokens: Tokens, defaults: boolean = false): void {
    this.tokens[auth] = tokens;
    if (defaults || Object.keys(this.tokens).length === 1) {
      this.setDefault(auth);
    }
  }

  public getTokens(auth?: string): Tokens {
    auth = auth || this.defaultAuthAlias;
    return this.tokens[auth];
  }

  public removeTokens(alias: string): void {
    // no key found, bail out
    if (!this.tokens[alias]) { return; }

    // fetch and delete all aliases
    const aliases = this.getTokenAliases(this.tokens[alias].access_token);
    aliases.forEach(key => delete this.tokens[key]);

    // reset to default if needed
    if(alias === this.defaultAuthAlias) {
      this.setDefault(APIKEY_DEFAULT_ALIAS);
    }
  }

  public clear(): void {
    this.tokens = {};
  }

  public getTokenAliases(accessToken: string): string[] {
    return getAliases(accessToken, this.tokens)
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
