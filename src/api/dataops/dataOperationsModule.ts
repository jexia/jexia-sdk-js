import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { Dataset } from "./dataset";
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";

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

  public terminate(): Promise<any> {
    delete this.queryExecuterBuilder;
    return Promise.resolve(this);
  }
}

export function condition(field: string, operator: string, value: string): FilteringCondition {
  return new FilteringCondition(field, operator, value);
}

export function complexCondition(filteringCondition: ICondition,
                                 logicalOperatorType: string): CompositeFilteringCondition {
  return new CompositeFilteringCondition(filteringCondition, logicalOperatorType);
}
