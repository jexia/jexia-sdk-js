import { IRequestAdapter } from "./requestAdapter";
import { TokenManager } from "./tokenManager";

export interface IModule {
  /* module should have init function that returns the promise of itself */
  init<T extends IModule>(tokenManager: TokenManager, requestAdapter: IRequestAdapter): Promise<T>;
}
