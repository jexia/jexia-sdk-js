import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFields, IFilter, ILimit, IOffset } from "./queryInterfaces";
import { QuerySet } from "./querySet";

export class DeleteQuery implements IFields, ILimit, IOffset, IFilter, IExecute {
    private query: QuerySet;
    private queryExecuter: QueryExecuter;
    public constructor(queryExecuter: QueryExecuter) {
        this.query = new QuerySet();
        this.queryExecuter = queryExecuter;
        this.query.Action = "delete";
    }
    public fields(...fields: string[]) {
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
    public filter(filter: ICondition) {
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
