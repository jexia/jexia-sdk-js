import { QueryExecuter } from "./queryExecuter";
import { IExecute} from "./queryInterfaces";
import { RecordSet } from "./recordSet";

export class InsertQuery implements  IExecute {
    private query: RecordSet;
    private queryExecuter: QueryExecuter;
    public constructor(queryExecuter: QueryExecuter, records: Array<object>) {
        this.query = new RecordSet();
        this.queryExecuter = queryExecuter;
        this.query.Action = "insert";
        this.query.Records = records;
    }
    public execute() {
        return this.query.execute(this.queryExecuter);
    }
}
