import { ReflectiveInjector } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { IModule, ModuleConfiguration } from "../core/module";
import { AuthOptions } from "../core/tokenManager";
import { DataSetName } from "./dataops.tokens";
import { Dataset } from "./dataset";

/**
 * Data Operation Module used to retrieve the dataset objects.
 * This object must be build from the helper functions, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * import { jexiaClient, dataOperations } from "jexia-sdk-js/node";
 *
 * const dataModule = dataOperations();
 *
 * jexiaClient().init(credentials, dataModule);
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
   * Return configuration
   */
  public getConfig(): { [moduleName: string]: ModuleConfiguration } {
    return { dataOperations: {} };
  }

  /**
   * Generates a dataset object of given name.
   * For TypeScript users it implements a generic type `T` that represents your dataset (defaults to `any`).
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

  /* tslint:disable:max-line-length */
  public datasets<A extends {}, B extends {}>(datasets: [string, string], auth?: string): [Dataset<A>, Dataset<B>];
  public datasets<A extends {}, B extends {}, C extends {}>(datasets: [string, string, string], auth?: string): [Dataset<A>, Dataset<B>, Dataset<C>];
  public datasets<A extends {}, B extends {}, C extends {}, D extends {}>(datasets: [string, string, string, string], auth?: string): [Dataset<A>, Dataset<B>, Dataset<C>, Dataset<D>];
  public datasets<A extends {}, B extends {}, C extends {}, D extends {}, E extends {}>(datasets: [string, string, string, string, string], auth?: string): [Dataset<A>, Dataset<B>, Dataset<C>, Dataset<D>, Dataset<E>];
  public datasets<A extends {}, B extends {}, C extends {}, D extends {}, E extends {}, F extends {}>(datasets: [string, string, string, string, string, string], auth?: string): [Dataset<A>, Dataset<B>, Dataset<C>, Dataset<D>, Dataset<E>, Dataset<F>];
  public datasets(datasets: string[], auth?: string): Dataset[];

  /**
   * Generates a list of datasets by given array of dataset names
   * @param datasets array of dataset names
   * @param auth optional user authorization alias
   */
  public datasets(datasets: string[], auth?: string) {
    return datasets.map((dataset) => this.dataset(dataset, auth));
  }

  /**
   * @internal
   */
  public terminate(): Promise<this> {
    return Promise.resolve(this);
  }
}
