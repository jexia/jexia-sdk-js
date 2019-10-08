import { ReflectiveInjector } from "injection-js";
import { API } from "../../config";
import { RequestAdapter, RequestMethod } from "../../internal/requestAdapter";
import { IModule, ModuleConfiguration } from "../core/module";
import { AuthOptions, TokenManager, Tokens } from "../core/tokenManager";

export interface IUMSSignInOptions {
  email: string;
  password: string;
  default?: boolean;
  alias?: string;
}

export type IUMSCredentials = Pick<IUMSSignInOptions, "email" | "password">;

export interface IUMSUser {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export class UMSModule implements IModule {

  private tokenManager: TokenManager;

  private requestAdapter: RequestAdapter;

  private projectId: string;

  public init(coreInjector: ReflectiveInjector) {
    this.tokenManager = coreInjector.get(TokenManager);
    this.requestAdapter = coreInjector.get(RequestAdapter);
    this.projectId = coreInjector.get(AuthOptions).projectID;

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

  public async signIn(user: IUMSSignInOptions): Promise<string> {

    const body = {
      method: "ums",
      email: user.email,
      password: user.password
    };

    return this.requestAdapter.execute<Tokens>(
      this.getUrl(API.AUTH, false),
      { body, method: RequestMethod.POST }
    ).then((tokens) => {
      this.tokenManager.addTokens([user.email, user.alias], tokens, user.default);
      return tokens.access_token;
    });
  }

  /**
   * Create a new UMS user
   * @param credentials {IUMSCredentials} email and password of created user
   */
  public signUp(credentials: IUMSCredentials): Promise<IUMSUser> {
    const body = {
      email: credentials.email,
      password: credentials.password
    };
    return this.requestAdapter.execute<IUMSUser>(
      this.getUrl(API.UMS.SIGNUP),
      { body, method: RequestMethod.POST },
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
  public getUser(alias: string): Promise<IUMSUser> {
    return this.tokenManager.token(alias)
      .then((token) => this.requestAdapter.execute<IUMSUser>(
        this.getUrl(API.UMS.USER),
        { headers: { Authorization: `Bearer ${token}` }},
      ));
  }

  /**
   * Change password of the authorized user
   * @param alias {string} Authorization alias
   * @param oldPassword {string}
   * @param newPassword {string}
   */
  public changePassword(alias: string, oldPassword: string, newPassword: string): Promise<IUMSUser> {
    const body = {
      old_password: oldPassword,
      new_password: newPassword,
    };
    return this.tokenManager.token(alias)
      .then((token) => this.requestAdapter.execute<IUMSUser>(
        this.getUrl(API.UMS.CHANGEPASSWORD),
        { body, headers: { Authorization: `Bearer ${token}` }, method: RequestMethod.POST },
      ));
  }

  /**
   * Delete currently authorized user
   * @param alias
   * @param password
   */
  public deleteUser(alias: string, password: string): Promise<any> {
    const body = { password };
    return this.tokenManager.token(alias)
      .then((token) => this.requestAdapter.execute(
        this.getUrl(API.UMS.USER),
        { body, headers: { Authorization: `Bearer ${token}` }, method: RequestMethod.DELETE },
      ));
  }

  /**
   * Generate API url
   * @param api {string} API endpoint
   * @param ums {boolean} Whether URL is a part of UMS API
   */
  private getUrl(api: string, ums = true): string {
    let url = `${API.PROTOCOL}://${this.projectId}.${API.HOST}.${API.DOMAIN}:${API.PORT}`;
    if (ums) {
      url += `/${API.UMS.ENDPOINT}`;
    }
    return `${url}/${api}`;
  }
}
