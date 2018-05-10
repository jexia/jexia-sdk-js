import { ReflectiveInjector } from "injection-js";

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
   * Terminate the Jexia Module
   */
  terminate(): Promise<this>;
}
