import { Query } from "./query";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFields, IFilter, ILimit, IOffset } from "./queryInterfaces";

export class SelectQuery implements IFields, ILimit, IOffset, IFilter, IExecute {
    private query: Query;
    private queryExecuter: QueryExecuter;
    private queryType: string;
    public constructor(queryExecuter: QueryExecuter) {
        this.query = new Query();
        this.queryExecuter = queryExecuter;
        this.queryType = "select";
    }
    public fields(fields: string[]) {
        this.query.Fields = fields;
        return this;
    }
    public limit(limit: number) {
        this.query.Limit = limit;
        return this;
    }
    public offset(offset: number) {
        this.query.Offset = offset;
        return this;
    }
    public filter(filter: any) {
        this.query.Filter = filter;
        return this;
    }
    public execute() {
        return this.query.execute(this.queryExecuter, this.queryType);
    }
}
