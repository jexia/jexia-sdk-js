import { ReflectiveInjector } from "injection-js";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { API, getApiUrl } from "../../config";
import { RequestExecuter } from "../../internal/executer";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { IModule, ModuleConfiguration } from "../core/module";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { DefaultResourceInterface, ResourceType } from "../core/resource";
import { AuthOptions, TokenManager, Tokens } from "../core/tokenManager";

export interface IUMSCredentials {
  email: string;
  password: string;
}

export type IUMSExtraFields = Omit<{ [key: string]: any }, "email" | "password">;

export type IUMSSignUpFields = IUMSCredentials & IUMSExtraFields;

export interface IUMSSignInOptions {
  default?: boolean;
  alias?: string;
}

/**
 * Default UMS interface type
 */
export type DefaultUsersInterface = {
  email: string;
  active: boolean;
};

/**
 * Merge customer's type with resource and UMS types
 */
export type UsersInterface<T> = T & DefaultResourceInterface & DefaultUsersInterface;

export class UMSModule<
  T extends object = any,
  D extends UsersInterface<T> = UsersInterface<T>> implements IModule {

  public readonly name = "users";

  public readonly resourceType = ResourceType.Users;

  private tokenManager: TokenManager;

  private requestAdapter: RequestAdapter;

  private requestExecuter: RequestExecuter;

  private basePath: string;

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

  public signIn(user: IUMSCredentials & IUMSSignInOptions): Observable<string> {
    const body = {
      method: "ums",
      email: user.email,
      password: user.password
    };

    const aliases = [user.email];

    if (user.alias) {
      aliases.push(user.alias);
    }

    return this.requestAdapter.execute<Tokens>(
      this.getUrl(API.AUTH, false),
      { body, method: RequestMethod.POST }
    ).pipe(
      map((tokens: Tokens) => {
        this.tokenManager.addTokens(aliases, tokens, user.default);
        return tokens.access_token;
      }),
    );
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

  public setDefault(alias: string): void {
    this.tokenManager.setDefault(alias);
  }

  public resetDefault(): void {
    this.tokenManager.resetDefault();
  }

  /**
   * Fetch currently authorized user
   * @param alias {string} Authorization alias
   */
  public getUser(alias: string): Observable<D> {
    return this.tokenManager.token(alias).pipe(
      switchMap((token: string) => this.requestAdapter.execute<D>(
        this.getUrl(API.UMS.USER),
        { headers: { Authorization: `Bearer ${token}` }},
      )),
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
