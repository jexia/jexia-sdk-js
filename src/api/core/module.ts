import { ReflectiveInjector } from "injection-js";

export interface IModule {
  /* module should have init function that returns the promise of itself */
  init(coreInjector: ReflectiveInjector): Promise<IModule>;
  terminate(): Promise<IModule>;
}
