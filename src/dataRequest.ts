import { compileDataRequest } from "./compiler/queryBasedCompiler";
import { RequestExecuter } from "./executer";
import { Query } from "./query";

export class DataRequest {
  private action: string;
  private query: Query;
  private records: Array<object>;

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

  public set Records(records: Array<object>){
    this.records = records;
  }

  public get Records(): Array<object> {
    return this.records;
  }

  public execute(queryExecuter: RequestExecuter): Promise<any> {
    return queryExecuter.executeRequest(compileDataRequest(this));
  }
}
