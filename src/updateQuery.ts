import { DataRequest } from "./dataRequest";
import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFilter, ILimit, IOffset } from "./queryInterfaces";

export class UpdateQuery implements ILimit, IOffset, IFilter, IExecute {
    private request: DataRequest;
    private queryExecuter: QueryExecuter;

    public constructor(queryExecuter: QueryExecuter, data: object, dataset: string) {
        this.request = new DataRequest("update", dataset);
        this.queryExecuter = queryExecuter;
        this.request.Query.Data = data;
    }
    public limit(limit: number) {
        this.request.Query.Limit = limit;
        return this;
    }
    public offset(offset: number) {
        this.request.Query.Offset = offset;
        return this;
    }
    public filter(filter: ICondition): UpdateQuery {
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
