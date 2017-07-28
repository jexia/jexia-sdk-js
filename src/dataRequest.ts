import { compileDataRequest } from "./compiler/queryBasedCompiler";
import { QueryExecuter } from "./queryExecuter";
import { QuerySet } from "./querySet";

export class DataRequest {
  private action: string;
  private query: QuerySet;
  private records: Array<object>;

  constructor(action: string, dataset: string) {
    this.action = action;
    this.query = new QuerySet(dataset);
  }

  public set Action(action: string){
    this.action = action;
  }

  public get Action(): string {
    return this.action;
  }

  public get Query(): QuerySet {
    return this.query;
  }

  public set Records(records: Array<object>){
    this.records = records;
  }

  public get Records(): Array<object> {
    return this.records;
  }

  public execute(queryExecuter: QueryExecuter): Promise<any> {
    return queryExecuter.executeQuery(compileDataRequest(this));
  }
}
