import { ReflectiveInjector } from "injection-js";
import { API } from "../../config";
import { Methods, RequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { AuthOptions, TokenManager, Tokens } from "../core/tokenManager";

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

  private projectId: string;

  public init(coreInjector: ReflectiveInjector) {
    this.tokenManager = coreInjector.get(TokenManager);
    this.requestAdapter = coreInjector.get(RequestAdapter);
    this.projectId = coreInjector.get(AuthOptions).projectID;

    return Promise.resolve(this);
  }

  public terminate() {
    return Promise.resolve(this);
  }

  public async signIn(user: IUMSSignInOptions): Promise<string> {

    const body = {
      method: 'ums',
      email: user.email,
      password: user.password
    };

    return this.requestAdapter.execute<Tokens>(
      this.getUrl(API.AUTH, false),
      { body, method: Methods.POST }
    ).then((tokens) => {

      this.tokenManager.addTokens(
        user.auth || user.email,
        tokens,
        user.default,
      );

      return tokens.token;
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

  public setDefault(auth: string): void {
    this.tokenManager.setDefault(auth);
  }

  public resetDefault(): void {
    this.tokenManager.resetDefault();
  }

  /* TODO Interfaces to develop
  public getUserById(id: string): Promise<IUMSUser> {}
  public changePassword() {}
  public deleteUser() {} */

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
