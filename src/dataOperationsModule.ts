import { Dataset } from "./dataset";
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";
import { IModule } from "./module";
import { QueryExecuterBuilder } from "./queryExecuterBuilder";
import { IRequestAdapter } from "./requestAdapter";
import { TokenManager } from "./tokenManager";

export default class DataOperationsModule implements IModule {
  private queryExecuterBuilder: QueryExecuterBuilder;

  public init(appUrl: string,
              tokenManager: TokenManager,
              requestAdapter: IRequestAdapter): Promise<DataOperationsModule> {
    this.queryExecuterBuilder = new QueryExecuterBuilder(appUrl, requestAdapter, tokenManager);
    return Promise.resolve(this);
  }

  public dataset(dataset: string, schema: string = "public"): Dataset {
    if (this.queryExecuterBuilder == null) {
      throw new Error("Client has not been initialised properly. Please instantiate \
                      client for invoking this method");
    }
    return new Dataset(schema, dataset, this.queryExecuterBuilder);
  }
}

export function condition(field: string, operator: string, value: string): FilteringCondition {
  return new FilteringCondition(field, operator, value);
}

export function complexCondition(filteringCondition: ICondition,
                                 logicalOperatorType: string): CompositeFilteringCondition {
  return new CompositeFilteringCondition(filteringCondition, logicalOperatorType);
}
