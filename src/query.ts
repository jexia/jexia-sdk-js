import { QueryCompiler } from "./compiler/queryCompiler";
import { QueryExecuter } from "./queryExecuter";
export class Query {
    private fields: string[];
    private limit: number;
    private offset: number;
    private filter: object;
    public set Fields(fields: string[]){
        this.fields = fields;
    };
    public set Limit(limit: number){
        this.limit = limit;
    }
    public get Limit(){
        return this.limit;
    }
    public set Offset(offset: number){
        this.offset = offset;
    }
    public get Offset(){
        return this.offset;
    }
    public set Filter(filter: object){
        this.filter = filter;
    }
    public execute(queryExecuter: QueryExecuter, queryType: string) {
        let compiler: QueryCompiler = new QueryCompiler(this, queryType);
        let queryParams: object;
        queryParams = compiler.compile();
        return queryExecuter.executeQuery(queryParams);
    }
}
