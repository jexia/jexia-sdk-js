import { API } from "../../config/config";
import { IAuthOptions } from "../core/tokenManager";
import { BaseAuth } from "./BaseAuth";

/**
 * @internal
 */
export class ApiKeyAuth extends BaseAuth {

  protected authUrl = API.AUTH.API_KEY;

  protected getLoginRequestBody(opts: IAuthOptions) {
    return {
      key: opts.key,
      secret: opts.secret,
    };
  }

}
