import { ReflectiveInjector } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { IModule } from "../core/module";
import { Dataset } from "./dataset";
import { DataSetName } from "./injectionTokens";

/**
 * Data Operation Module used to retrieve the dataset objects.
 * This object must be build from the helper functions, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * import { jexiaClient, dataOperations } from "jexia-sdk-js/node";
 *
 * const dataModule = dataOperations();
 *
 * jexiaClient().init({projectID: "your Jexia App URL", key: "username", secret: "password"}, dataModule);
 * ```
 */
export class DataOperationsModule implements IModule {
  private injector: ReflectiveInjector;

  /**
   * @internal
   */
  public init(
    coreInjector: ReflectiveInjector,
  ): Promise<this> {
    this.injector = coreInjector.resolveAndCreateChild([
      {
        provide: DataSetName,
        useFactory: () => { throw new Error("Please set the dataset name at the DI"); },
      },
      RequestExecuter,
      Dataset,
    ]);
    return Promise.resolve(this);
  }

  /**
   * Generates a dataset object of given name.
   * For TypeScript users it implements a generic type T that represents your dataset, default to any.
   * @template T Generic type of your dataset, default to any
   * @param dataset name of the dataset
   * @returns Dataset object used to fetch and modify data at your datasets.
   */
  public dataset<T = any>(dataset: string): Dataset<T> {
    return this.injector.resolveAndCreateChild([
      {
        provide: DataSetName,
        useValue: dataset,
      },
      RequestExecuter,
      Dataset,
    ]).get(Dataset);
  }

  /**
   * @internal
   */
  public terminate(): Promise<this> {
    return Promise.resolve(this);
  }
}
