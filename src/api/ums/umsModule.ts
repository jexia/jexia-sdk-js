import { ReflectiveInjector } from "injection-js";
import { iif, Observable, of } from "rxjs";
import { map, switchMap, pluck, tap, catchError, concatMap } from "rxjs/operators";
import { API, getApiUrl, MESSAGE } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { toQueryParams, parseQueryParams } from "../../internal/utils";
import { IModule, ModuleConfiguration } from "../core/module";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { ResourceType } from "../core/resource";
import { Dispatcher, DispatchEvents } from "../core/dispatcher";
import { AuthOptions, TokenManager, Tokens } from "../core/tokenManager";
import { UsersInterface, IUMSSignInOptions, IUMSSignUpFields, IUMOAuthInitOptions } from "./ums.types";
import { getSignInParams } from "./ums.functions";

export class UMSModule<
  T extends object = any,
  D extends UsersInterface<T> = UsersInterface<T>> implements IModule {

  public readonly name = "users";

  public readonly resourceType = ResourceType.Users;

  private tokenManager: TokenManager;

  private requestAdapter: RequestAdapter;

  private requestExecuter: RequestExecuter;

  private dispatcher: Dispatcher;

  private basePath: string;

  private currentUserObject: D | null = null;

  public get currentUser(): D | null {
    return this.currentUserObject;
  }

  constructor() {
    /* users tend to init module without a new operator, throw a hint error */
    if (!(this instanceof UMSModule)) {
      throw new Error("UMS module initialized incorrectly, you need to include 'new'");
    }
  }

  public init(coreInjector: ReflectiveInjector) {
    const injector = coreInjector.resolveAndCreateChild([RequestExecuter]);

    this.tokenManager = injector.get(TokenManager);
    this.requestAdapter = injector.get(RequestAdapter);
    this.basePath = getApiUrl(injector.get(AuthOptions));
    this.requestExecuter = injector.get(RequestExecuter);
    this.dispatcher = injector.get(Dispatcher);

    return Promise.resolve(this);
  }

  /**
   * Return configuration
   */
  public getConfig(): { [moduleName: string]: ModuleConfiguration } {
    return { ums: {} };
  }

  public terminate() {
    return Promise.resolve(this);
  }

  /**
   * Starts the first step of the OAuth process.
   *
   * - When `redirect` is true and this code is running in a browser, it will redirect to the provider's
   *   authentication page.
   *
   * @param options The options object for the OAuth initialization
   * @param redirect Whether to redirect to the proper provider's oauth page (default to true)
   */
  public initOAuth(options: IUMOAuthInitOptions, redirect = true): Observable<string> {
    return this.requestAdapter.execute<{ oauth_url: string }>(
      this.getUrl(API.OAUTH.INIT, false) + parseQueryParams(toQueryParams(options)),
      { method: RequestMethod.GET },
    ).pipe(
      pluck("oauth_url"),
      tap((url: string) => {
        if (redirect && typeof window === "object") {
          window.location.assign(url);
        }
      }),
    );
  }

  /**
   * Signs in a user either with credentials or through OAuth steps.
   *
   * @param options User credentials or oauth params + alias options
   */
  public signIn(options: IUMSSignInOptions): Observable<D> {
    const { body, aliases, endpoint } = getSignInParams(options);
    const [alias] = aliases;

    return this.requestAdapter.execute<Tokens>(
      this.getUrl(endpoint, false),
      { body, method: RequestMethod.POST },
    ).pipe(
      map((tokens: Tokens) => {
        this.tokenManager.addTokens(aliases, tokens, options.default);
        return tokens.access_token;
      }),
      switchMap(() => this.getUser(alias)),
      tap(() => this.dispatcher.emit(DispatchEvents.UMS_LOGIN)),
    );
  }

  /**
   * Signs out a user
   * - by just removing the token that belongs to the user/alias
   * - clear the currentUser object
   *
   * By default it checks on the token that is marked as DEFAULT otherwise it will use the given alias
   *
   * @param alias The alias/key that is assigned to the tokens
   */
  public signOut(alias?: string): void {
    const validatedAlias = this.tokenManager.validateTokenAlias(alias);

    if (!validatedAlias) {
      return;
    }

    this.tokenManager.removeTokens(validatedAlias as string);

    this.currentUserObject = null;

    this.dispatcher.emit(DispatchEvents.UMS_LOGOUT);
  }

  /**
   * Create a new UMS user
   * @param credentials {IUMSSignUpFields} email, password and possible extra fields of created user
   */
  public signUp(credentials: IUMSSignUpFields): Observable<D> {
    return this.requestAdapter.execute<D>(
      this.getUrl(API.UMS.SIGNUP),
      { body: credentials, method: RequestMethod.POST },
    );
  }

  /**
   * Check if the user is logged in
   * By default it checks on the token that is marked as DEFAULT otherwise it will use the given alias
   *
   * @param alias {string}
   */
  public isLoggedIn(alias?: string): Observable<boolean> {
    const validatedAlias = this.tokenManager.validateTokenAlias(alias);

    if (!validatedAlias) {
      return of(false);
    }

    // this stream only get subscribed (its get called) when the user is loggedIn and the user object is empty
    // this indicate that the user did a refresh while was logged in
    const getUser = () => this.getUser(validatedAlias as string).pipe(
      catchError(() => of(false)), // in case of an error, just return false
      map(() => true), // return true, as the user is logged in if we get result
    );

    // when the token has been expired, its running automatically the "/refresh" call to fetch a new one.
    // So we test just on the error, i.e. when the alias does not exist at all.
    return this.tokenManager.token(validatedAlias as string).pipe(
      catchError(() => of(false)),
      map(val => val !== false),
      concatMap(isLoggedIn => iif(
        () => isLoggedIn && this.currentUserObject === null,
        getUser(),
        of(isLoggedIn))),
    );
  }

  /**
   * Switch a user based on the current logged in users
   *
   * @param alias {string}
   */
  public switchUser(alias: string): void {
    const validatedAlias = this.tokenManager.validateTokenAlias(alias);

    if (!validatedAlias) {
      throw new Error(MESSAGE.TOKEN_MANAGER.ALIAS_NOT_FOUND);
    }

    this.dispatcher.emit(DispatchEvents.UMS_SWITCH_USER);

    this.tokenManager.setDefault(alias);
  }

  /**
   * Deprecated in favor of switchUser
   *
   * @deprecated
   * @param alias {string}
   */
  public setDefault(alias: string): void {
    this.switchUser(alias);
  }

  public resetDefault(): void {
    this.tokenManager.resetDefault();
  }

  /**
   * Fetch currently authorized user
   * @param alias {string} Authorization alias
   */
  public getUser(alias?: string): Observable<D> {
    const validatedAlias = this.tokenManager.validateTokenAlias(alias);

    if (!validatedAlias) {
      throw new Error(MESSAGE.TOKEN_MANAGER.ALIAS_NOT_FOUND);
    }

    return this.tokenManager.token(validatedAlias as string).pipe(
      switchMap((token: string) => this.requestAdapter.execute<D>(
        this.getUrl(API.UMS.USER),
        { headers: { Authorization: `Bearer ${token}` }},
      )),
      tap(user => this.currentUserObject = user),
    );
  }

  /**
   * Change password of the authorized user
   * @param alias {string} Authorization alias
   * @param oldPassword {string}
   * @param newPassword {string}
   */
  public changePassword(alias: string, oldPassword: string, newPassword: string): Observable<D> {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    return this.tokenManager.token(alias).pipe(
      switchMap((token) => this.requestAdapter.execute<D>(
        this.getUrl(API.UMS.CHANGEPASSWORD),
        { body, headers: { Authorization: `Bearer ${token}` }, method: RequestMethod.POST },
      )),
    );
  }

  /**
   * Delete currently authorized user
   * @param alias
   * @param password
   */
  public deleteUser(alias: string, password: string): Observable<void> {
    const body = { password };
    return this.tokenManager.token(alias).pipe(
      switchMap((token) => this.requestAdapter.execute(
        this.getUrl(API.UMS.USER),
        { body, headers: { Authorization: `Bearer ${token}` }, method: RequestMethod.DELETE },
      )),
    );
  }

  /**
   * Select users from UMS
   *
   * @example
   * ums.select().where(
   *   field => field("active").isEqualTo(true)
   * ).subscribe();
   */
  public select(): SelectQuery<D> {
    return new SelectQuery(this.requestExecuter, this.resourceType, this.name);
  }

  /**
   * Update users in UMS
   *
   * @param record Object that represent user fields to be updated
   * @example
   *   ums.update({ active: false })
   *     .where(field => field("email").isEqualTo("ilon.mask@tesla.com"))
   *     .subscribe();
   */
  public update(record: Partial<D>): UpdateQuery<D> {
    return new UpdateQuery(this.requestExecuter, record, this.resourceType, this.name);
  }

  /**
   * Delete users from UMS
   * @example
   *   ums.delete()
   *     .where(field => field("id).isEqualTo("d463d501-96c3-405c-aa13-4cc28acf26d5")
   *     .subscribe()
   */
  public delete(): DeleteQuery<D> {
    return new DeleteQuery(this.requestExecuter, this.resourceType, this.name);
  }

  /**
   * Requests a password reset for the given user e-mail.
   * The user should receive an e-mail message with instructions.
   * @param email The e-mail address of the user to be reset.
   */
  public requestResetPassword(email: string): Observable<D> {
    return this.requestAdapter.execute<D>(
      this.getUrl(API.UMS.RESETPASSWORD),
      { body: { email }, method: RequestMethod.POST },
    );
  }

  /**
   * Resets user's password to a new one
   * @param resetToken The reset token the user received
   * @param newPassword the new password to be set
   */
  public resetPassword(resetToken: string, newPassword: string): Observable<D> {
    const body = { new_password: newPassword };
    return this.requestAdapter.execute<D>(
      this.getUrl(API.UMS.RESETPASSWORD) + `/${resetToken}`,
      { body, method: RequestMethod.POST },
    );
  }

  /**
   * Generate API url
   * @param api API endpoint
   * @param ums Whether URL is a part of UMS API
   */
  public getUrl(api: string, ums = true): string {
    let url = this.basePath;
    if (ums) {
      url += `/${API.UMS.ENDPOINT}`;
    }
    return `${url}/${api}`;
  }
}
