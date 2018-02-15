import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { IExecutable} from "./queryInterfaces";

export class InsertQuery<T = any> implements IExecutable {
  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, records: T[], dataset: string) {
    this.request = new DataRequest("insert", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Records = records;
  }
  public execute(): Promise<T[]> {
    return this.request.execute(this.queryExecuter);
  }
}
