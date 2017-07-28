import { DataRequest } from "./dataRequest";
import { QueryExecuter } from "./queryExecuter";
import { IExecute} from "./queryInterfaces";

export class InsertQuery implements  IExecute {
    private request: DataRequest;
    private queryExecuter: QueryExecuter;

    public constructor(queryExecuter: QueryExecuter, records: Array<object>, dataset: string) {
        this.request = new DataRequest("insert", dataset);
        this.queryExecuter = queryExecuter;
        this.request.Records = records;
    }
    public execute() {
        return this.request.execute(this.queryExecuter);
    }
}
