import { ReflectiveInjector } from "injection-js";

export type ModuleConfiguration = {
  [key: string]: any,
};

/**
 * Interface used for all Jexia modules
 */
export interface IModule {
  /**
   * Initialize the Jexia Module
   * @param coreInjector main dependency injector of the Jexia client
   */
  init(coreInjector: ReflectiveInjector): Promise<this>;
  /**
   * Get module configuration
   */
  getConfig(): { [moduleName: string]: ModuleConfiguration };
  /**
   * Terminate the Jexia Module
   */
  terminate(): Promise<this>;
}
