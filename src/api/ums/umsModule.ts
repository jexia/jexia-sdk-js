import { ReflectiveInjector } from "injection-js";
import { API } from "../../config";
import { Methods, RequestAdapter } from "../../internal/requestAdapter";
import { Client, ClientInit } from "../core/client";
import { IModule } from "../core/module";
import { AuthOptions, TokenManager } from "../core/tokenManager";

export interface IUMSSignInOptions {
  email: string;
  password: string;
  default?: boolean;
  auth?: string;
}

export type IUMSCredentials = Pick<IUMSSignInOptions, 'email' | 'password'>;

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

  private systemInit: Promise<Client>;

  private projectId: string;

  public init(coreInjector: ReflectiveInjector) {
    this.tokenManager = coreInjector.get(TokenManager);
    this.requestAdapter = coreInjector.get(RequestAdapter);
    this.systemInit = coreInjector.get(ClientInit);
    this.projectId = coreInjector.get(AuthOptions).projectID;

    return Promise.resolve(this);
  }

  public terminate() {
    return Promise.resolve(this);
  }

  public async signIn(user: IUMSSignInOptions): Promise<{id: string}> {
    const token = await this.getToken();
    const body = {
      email: user.email,
      password: user.password
    };

    return this.requestAdapter.execute(
      this.getUrl(API.AUTH, false),
      { headers: { Authorization: `Bearer ${token}` }, body, method: Methods.POST }
    ).then((result: { id: string, token: string, refresh_token: string }) => {

      // save auth
      // TODO update tokenManager to support multiple auth
      // this.tokenManager.addAuth(token, user.auth, user.default);

      return result;
    });
  }

  /**
   * Create a new UMS user
   * @param credentials {IUMSCredentials} email and password of created user
   */
  public signUp(credentials: IUMSCredentials): Promise<IUMSUser> {
    return this.requestAdapter.execute<IUMSUser>(
      this.getUrl(API.UMS.SIGNUP),
      { body: credentials, method: Methods.POST },
    );
  }

  /* TODO Interfaces to develop
  public setDefault(auth: string): void {}
  public resetDefault(): void {}
  public getUserById(id: string): Promise<IUMSUser> {}
  public changePassword() {}
  public deleteUser() {} */

  /**
   * Wait until client will be initialized and return the actual token
   * @returns {Promise<string>} token
   */
  private async getToken(): Promise<string> {
    await this.systemInit;
    return await this.tokenManager.token();
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
