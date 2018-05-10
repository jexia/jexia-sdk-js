import { RequestExecuter } from "../../internal/executer";
import { Query } from "../../internal/query";
import { compileDataRequest } from "../../internal/queryBasedCompiler";

/**
 * @internal
 */
export class DataRequest<T = any> {
  private action: string;
  private query: Query<T>;
  private records: T[];

  constructor(action: string, dataset: string) {
    this.action = action;
    this.query = new Query(dataset);
  }

  public set Action(action: string){
    this.action = action;
  }

  public get Action(): string {
    return this.action;
  }

  public get Query(): Query {
    return this.query;
  }

  public set Records(records: T[]){
    this.records = records;
  }

  public get Records(): T[] {
    return this.records;
  }

  public execute(queryExecuter: RequestExecuter): Promise<T[]> {
    return queryExecuter.executeRequest(compileDataRequest(this));
  }
}
