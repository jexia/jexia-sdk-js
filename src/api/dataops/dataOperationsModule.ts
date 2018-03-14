import { ReflectiveInjector } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { IModule } from "../core/module";
import { Dataset } from "./dataset";
import { DataSetName } from "./injectionTokens";

export class DataOperationsModule implements IModule {
  private injector: ReflectiveInjector;

  public init(
    coreInjector: ReflectiveInjector,
  ): Promise<DataOperationsModule> {
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

  public terminate(): Promise<DataOperationsModule> {
    return Promise.resolve(this);
  }
}
