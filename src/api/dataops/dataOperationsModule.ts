import { ReflectiveInjector } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { IModule } from "../core/module";
import { AuthOptions } from "../core/tokenManager";
import { DataSetName } from "./dataops.tokens";
import { Dataset } from "./dataset";

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
   * @param auth use specific authorization
   * @returns Dataset object used to fetch and modify data at your datasets.
   */
  public dataset<T extends object = any>(dataset: string, auth?: string): Dataset<T> {
    let config = this.injector.get(AuthOptions);
    if (auth) {
      config.auth = auth;
    }
    return this.injector.resolveAndCreateChild([
      {
        provide: DataSetName,
        useValue: dataset,
      },
      {
        provide: AuthOptions,
        useValue: config,
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
