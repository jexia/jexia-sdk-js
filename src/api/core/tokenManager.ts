import { Injectable, InjectionToken } from "injection-js";
import { from, Observable, iif, of } from "rxjs";
import { catchError, map, tap, switchMap, finalize } from "rxjs/operators";
import { API, MESSAGE, getApiUrl, getProjectId, APIKEY_DEFAULT_ALIAS } from "../../config";
import { IRequestError, RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { delayTokenRefresh, isTokenExpired } from "../../internal/utils";
import { Logger } from "../logger/logger";
import { TokenStorage } from "./componentStorage";

/**
 * API interface of the authorization token
 */
export type Tokens = {
  /**
   * JSON web token
   */
  access_token: string,
  /**
   * Refresh token
   */
  refresh_token: string,
};

/**
 * Authorization options of the project
 */
export interface IAuthOptions {
  /**
   * Project ID
   */
  readonly projectID?: string | null;
  /**
   * Project Zone
   */
  readonly zone?: string | null;
  /**
   * Project URL (using this field overrides zone and projectID when composing the project url)
   */
  readonly projectURL?: string | null;
  /**
   * Authorization alias. Used for multiple authorization methods at the same time
   * by default used 'apikey'
   */
  auth?: string;
  /**
   * Project Key
   */
  readonly key?: string;
  /**
   * Project Password
   */
  readonly secret?: string;
  /**
   * Token refresh interval
   */
  readonly refreshInterval?: number;
  /**
   * Remember user flag
   */
  readonly remember?: boolean;
}

export const AuthOptions = new InjectionToken<IAuthOptions>("IAuthOptions");

/**
 * Not undefined type guard
 * @internal
 * @param x
 */
function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

/**
 * Keep token pairs and refresh them when its needed
 */
@Injectable()
export class TokenManager {
  /* Default error for auth options parameter validation */
  public readonly authOptionsError = new Error(`You should provide either "projectID" or "projectURL" to initialize`);

  /* used for getting the project url */
  private config: IAuthOptions;

  /* store timeouts to be able to end refresh loop from outside */
  private refreshes: Map<string, any> = new Map<string, any>();

  /* initialize promise */
  private initPromise: Promise<this>;

  /* keep token promises */
  private defers: { [key: string]: Promise<any> } = {};

  private get resolved(): Promise<any[]> {
    return Promise.all([
      this.initPromise,
      ...Object.values(this.defers)
    ]);
  }

  private storage = TokenStorage.getStorageAPI();

  public get defaultAuthAlias(): string {
    return this.storage.defaultAuthAlias || "";
  }

  constructor(
    private requestAdapter: RequestAdapter,
    private logger: Logger,
  ) {}

  /**
   * Get access token for the specific authentication alias (APK by default)
   * When a token is expired, try to refresh the token
   * @param {string} auth Authentication alias
   */
  public token(auth?: string): Observable<string> {
    // refreshing a token means: cancel current digest for expired token, fetch new token, start new digest with new token
    // due the digest, we are sure that it will not come to this, but to be 100% sure, its required deal with this
    const $refresh = (accessToken: string): Observable<string> => {
      const aliases: string[] = this.storage.getTokenAliases(accessToken);
      return of(accessToken).pipe(
        tap(currentAccessToken => this.removeRefreshDigest(currentAccessToken)),
        switchMap(() => this.refresh(aliases)),
        map(({ access_token }: Tokens): string => access_token),
        tap(newAccessToken => this.startRefreshDigest(aliases, newAccessToken)),
      );
    };

    return from(this.resolved).pipe(
      map(() => {
        const tokens = this.storage.getTokens(auth);
        if (!tokens) {
          throw new Error(MESSAGE.TOKEN_MANAGER.TOKEN_NOT_AVAILABLE);
        }
        return tokens.access_token;
      }),
      // check if the token is expired, if so, refresh the token and assign it to the storage
      switchMap((accessToken: string) => iif(
        () => isTokenExpired(accessToken), $refresh(accessToken), of(accessToken)),
      ),
    );
  }

  private validateAuthOptions({ projectID, projectURL }: IAuthOptions): void {
    if (!projectID && !projectURL) {
      throw this.authOptionsError;
    }
  }

  /**
   * Initialize Token Manager
   * should be always initialized with projectID
   * ApiKey auth is optional
   * @param {IAuthOptions} opts Initialize options
   */
  public init(opts: IAuthOptions): Promise<TokenManager> {
    this.validateAuthOptions(opts);

    this.config = opts;

    this.initPromise = Promise.resolve(this);

    /* if auth is provided */
    if (opts.key && opts.secret) {
      this.initPromise = this.initPromise
        .then(() => this.login(opts).toPromise())
        .then(() => this);
    }

    return this.initPromise;
  }

  /** Terminate token manager and clear all tokens
   */
  public terminate(): void {
    this.storage.clear();
    this.refreshes.forEach(timeout => clearTimeout(timeout));
    this.refreshes.clear();
  }

  /**
   * Set specific token to use by default
   * @param {string} auth authentication alias
   */
  public setDefault(auth: string): void {
    this.storage.setDefault(auth);
  }

  /**
   * Switch back to apikey token
   */
  public resetDefault(): void {
    this.storage.setDefault(APIKEY_DEFAULT_ALIAS);
  }

  /**
   * Add new token pair and run refresh digest
   * @param {Array<string | undefined>} aliases an array of authenticate aliases
   * @param {Tokens} tokens Token pair
   * @param {boolean} defaults Whether to use this token by default
   */
  public addTokens(aliases: Array<string | undefined>, tokens: Tokens, defaults?: boolean) {

    const definedAliases: string[] = aliases.filter(notUndefined);

    /* Store token pairs for each alias but make default the first one only */
    definedAliases.forEach((alias, index) => {
      this.storage.setTokens(alias, tokens, !index && defaults);
    });

    this.startRefreshDigest(definedAliases, tokens.access_token);
  }

  /**
   * Remove a token based on the name of the key
   *
   * @param {string} alias The key to identify the token
   */
  public removeTokens(alias: string): void {
    this.storage.removeTokens(alias);
  }

  /**
   * Start refreshing digest for the specific auth based on the exp value from the token
   * @ignore
   */
  private startRefreshDigest(aliases: string[], accessToken: string) {
    const delay = delayTokenRefresh(accessToken);
    const timer = setTimeout(() => {
      this.logger.debug("tokenManager", `refresh ${aliases[0]} token`);
      this.refresh(aliases)
        .pipe(
          finalize(() => this.removeRefreshDigest(accessToken)),
        )
        .subscribe(
          ({ access_token }: Tokens) => this.startRefreshDigest(aliases, access_token), // start a digest for the new token
          () => this.terminate(), // TODO: send an event out, so the user can act on that
        );
    }, delay);

    // save the timeout ref, and ref it to the accessToken key
    this.refreshes.set(accessToken, timer);
  }

  /**
   * Stop a refreshing digest
   * @ignore
   */
  private removeRefreshDigest(currentAccessToken: string): void {
    if(this.refreshes.has(currentAccessToken)) {
      const timer = this.refreshes.get(currentAccessToken);

      clearTimeout(timer);
      this.refreshes.delete(currentAccessToken);
    }
  }

  /**
   * Login to the project using APK method
   * @ignore
   */
  private login({auth = APIKEY_DEFAULT_ALIAS, key, secret}: IAuthOptions): Observable<Tokens> {
    return this.obtainTokens(auth, this.authUrl, { method: "apk", key, secret }).pipe(
      tap((tokens: Tokens) => this.addTokens([auth], tokens, true)),
    );
  }

  /**
   * Refresh the token
   * @ignore
   */
  private refresh([auth, ...restAliases]: string[] = []): Observable<Tokens> {

    const tokens = this.storage.getTokens(auth);

    if (!tokens || !tokens.refresh_token) {
      throw new Error(`There is no refresh token for ${auth}`);
    }

    return this.obtainTokens(auth, this.refreshUrl, { refresh_token: tokens.refresh_token }).pipe(
      tap((refreshedTokens: Tokens) =>
        [auth, ...restAliases].forEach((alias) =>  this.storage.setTokens(alias, refreshedTokens)),
      ),
      catchError(() => {
        throw new Error("Refreshing token failed");
      }),
    );
  }

  /**
   * Get tokens from the project
   * @ignore
   */
  private obtainTokens(auth: string, url: string, body: object): Observable<Tokens> {

    let resolve: (value?: any) => void;
    this.defers[auth] = new Promise((r) => resolve = r);

    return this.requestAdapter.execute(url, {
      body,
      method: RequestMethod.POST,
    }).pipe(
      tap((refreshedTokens: Tokens) => resolve(refreshedTokens.access_token)),
      catchError((error: IRequestError) => {
        delete this.defers[auth];
        throw {
          httpStatus: error.httpStatus,
          message: this.getErrorMessage(error),
        };
      }),
    );
  }

  /**
   * Project url
   * @ignore
   */
  private get url(): string {
    return getApiUrl(this.config);
  }

  /**
   * Authenticate url
   * @ignore
   */
  private get authUrl(): string {
    return `${this.url}/${API.AUTH}`;
  }

  /**
   * Refresh token url
   * @ignore
   */
  private get refreshUrl(): string {
    return `${this.url}/${API.REFRESH}`;
  }

  public getErrorMessage({ httpStatus: { code, status } }: IRequestError): string {
    if (code === 404) {
      return `Authorization failed: project ${getProjectId(this.config)} not found.`;
    }
    return `Authorization failed: ${code} ${status}`;
  }

  /**
   * Validate an alias by checking if the alias has been set.
   * If not, fallback to the default alias if a custom one is set by the user, but ignore the system_default alias.
   */
  public validateTokenAlias(alias?: string): boolean | string {
    // bail out if the alias is not set and the default is set to the SYSTEM DEFAULT
    if (!alias && this.defaultAuthAlias === APIKEY_DEFAULT_ALIAS) {
      return false;
    }

    // bail out if the alias has never been used
    if (alias && !this.storage.getAllTokenAliases().includes(alias)) {
      return false;
    }

    return !alias ? this.defaultAuthAlias : alias;
  }
}
