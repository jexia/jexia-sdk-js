import { QueryExecuter } from "./queryExecuter";
import { IExecute} from "./queryInterfaces";
import { QuerySet } from "./querySet";

export class InsertQuery implements  IExecute {
    private query: QuerySet;
    private queryExecuter: QueryExecuter;
    public constructor(queryExecuter: QueryExecuter, records: Array<object>) {
        this.query = new QuerySet();
        this.queryExecuter = queryExecuter;
        this.query.Action = "insert";
        this.query.Records = records;
    }
    public execute() {
        return this.query.execute(this.queryExecuter);
    }
}
