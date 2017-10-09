import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { Dataset } from "./dataset";

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
