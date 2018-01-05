import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { IRequestAdapter } from "../../internal/requestAdapter";
import { IModule } from "../core/module";
import { TokenManager } from "../core/tokenManager";
import { Dataset } from "./dataset";

export class DataOperationsModule implements IModule {
  private queryExecuterBuilder: QueryExecuterBuilder;

  public init(projectID: string,
              tokenManager: TokenManager,
              requestAdapter: IRequestAdapter): Promise<DataOperationsModule> {
    this.queryExecuterBuilder = new QueryExecuterBuilder(projectID, requestAdapter, tokenManager);
    return Promise.resolve(this);
  }

  public dataset(dataset: string): Dataset {
    if (this.queryExecuterBuilder == null) {
      throw new Error("Client has not been initialised properly. Please instantiate \
                      client for invoking this method");
    }
    return new Dataset(dataset, this.queryExecuterBuilder);
  }

  public terminate(): Promise<any> {
    delete this.queryExecuterBuilder;
    return Promise.resolve(this);
  }
}
