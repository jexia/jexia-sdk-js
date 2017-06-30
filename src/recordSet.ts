import { RecordBasedCompiler } from "./compiler/recordBasedCompiler";
import { QueryExecuter } from "./queryExecuter";
export class RecordSet {
    private action: string;
    private records: Array<object>;
    public set Action(action: string){
        this.action = action;
    };
    public set Records(records: Array<object>){
        this.records = records;
    }
    public execute(queryExecuter: QueryExecuter) {
        let compiler: RecordBasedCompiler = new RecordBasedCompiler(this);
        let queryParams: object;
        queryParams = compiler.compile();
        return queryExecuter.executeQuery(queryParams);
    }
}
