import { IRequestAdapter } from "../../internal/requestAdapter";
import { TokenManager } from "./tokenManager";

export interface IModule {
  /* module should have init function that returns the promise of itself */
  init(appUrl: string, tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<IModule>;
  terminate(): Promise<any>;
}
