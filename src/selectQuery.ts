import { DataRequest } from "./dataRequest";
import { Dataset } from "./dataset";
import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFields, IFilter, ILimit, IOffset, IRelational } from "./queryInterfaces";

export class SelectQuery implements IFields, ILimit, IOffset, IFilter, IExecute, IRelational {
    private request: DataRequest;
    private queryExecuter: QueryExecuter;

    public constructor(queryExecuter: QueryExecuter, dataset: string) {
        this.request = new DataRequest("select", dataset);
        this.queryExecuter = queryExecuter;
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

    public filter(filter: ICondition): SelectQuery {
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

    // tslint:disable-next-line:max-line-length
    public relation(dataSet: Dataset, callback: (query: SelectQuery) => SelectQuery = (q: SelectQuery) => q): SelectQuery {
      let relation: SelectQuery = callback(dataSet.select());
      this.request.Query.AddRelation(relation.request.Query);
      return this;
    }

    public execute() {
        return this.request.execute(this.queryExecuter);
    }
}
