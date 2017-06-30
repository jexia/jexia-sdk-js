import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFilter, ILimit, IOffset } from "./queryInterfaces";
import { QuerySet } from "./querySet";

export class UpdateQuery implements ILimit, IOffset, IFilter, IExecute {
    private query: QuerySet;
    private queryExecuter: QueryExecuter;
    public constructor(queryExecuter: QueryExecuter, data: object) {
        this.query = new QuerySet();
        this.queryExecuter = queryExecuter;
        this.query.Action = "update";
        this.query.Data = data;
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
    public sortAsc(...fields: string[]) {
        this.query.AddSortCondition("asc", ...fields);
        return this;
    }
    public sortDesc(...fields: string[]) {
        this.query.AddSortCondition("desc", ...fields);
        return this;
    }
    public execute() {
        return this.query.execute(this.queryExecuter);
    }
}
