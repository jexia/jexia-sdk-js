import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { IExecutable} from "./queryInterfaces";

export class InsertQuery implements  IExecutable {
  private request: DataRequest;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, records: Array<object>, dataset: string) {
    this.request = new DataRequest("insert", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Records = records;
  }
  public execute() {
    return this.request.execute(this.queryExecuter);
  }
}
