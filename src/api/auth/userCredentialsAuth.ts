import { API } from "../../config/config";
import { IAuthOptions } from "../core/tokenManager";
import { BaseAuth } from "./BaseAuth";

export class UserCredentialsAuth extends BaseAuth {

  protected authUrl = API.AUTH.USER_CREDENTIALS;

  protected getLoginRequestBody(opts: IAuthOptions) {
    return {
      email: opts.key,
      password: opts.secret,
    };
  }

}
