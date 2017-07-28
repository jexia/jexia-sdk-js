import { DataRequest } from "./dataRequest";
import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFields, IFilter, ILimit, IOffset } from "./queryInterfaces";

export class DeleteQuery implements IFields, ILimit, IOffset, IFilter, IExecute {
    private request: DataRequest;
    private queryExecuter: QueryExecuter;
    public constructor(queryExecuter: QueryExecuter, dataset: string) {
        this.request = new DataRequest("delete", dataset);
        this.queryExecuter = queryExecuter;
        this.request.Action = "delete";
    }
    public fields(...fields: string[]) {
        this.request.Query.Fields = fields;
        return this;
    }
    public limit(limit: number) {
        this.request.Query.Limit = limit;
        return this;
    }
    public offset(offset: number) {
        this.request.Query.Offset = offset;
        return this;
    }
    public filter(filter: ICondition): DeleteQuery {
        this.request.Query.Filter = filter;
        return this;
    }
    public sortAsc(...fields: string[]) {
        this.request.Query.AddSortCondition("asc", ...fields);
        return this;
    }
    public sortDesc(...fields: string[]) {
        this.request.Query.AddSortCondition("desc", ...fields);
        return this;
    }
    public execute() {
        return this.request.execute(this.queryExecuter);
    }
}
