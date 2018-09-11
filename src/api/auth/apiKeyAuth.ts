import { API } from "../../config";
import { IAuthOptions } from "../core/tokenManager";
import { BaseAuth } from "./BaseAuth";

/**
 * @internal
 */
export class ApiKeyAuth extends BaseAuth {

  protected authUrl = API.AUTH.API_KEY;

  protected getLoginRequestBody(opts: IAuthOptions) {
    return {
      method: "apk",
      key: opts.key,
      secret: opts.secret,
    };
  }

}
