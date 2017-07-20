import { Dataset } from "./dataset";
import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";
import { IExecute, IFields, IFilter, ILimit, IOffset, IRelational } from "./queryInterfaces";
import { QuerySet } from "./querySet";

export class SelectQuery implements IFields, ILimit, IOffset, IFilter, IExecute, IRelational {
    private query: QuerySet;
    private queryExecuter: QueryExecuter;

    public constructor(queryExecuter: QueryExecuter) {
        this.query = new QuerySet();
        this.queryExecuter = queryExecuter;
        this.query.Action = "select";
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

    public filter(filter: ICondition): SelectQuery {
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

    public relation(dataSet: Dataset, callback: (query: SelectQuery) => SelectQuery): SelectQuery {
      let relation: SelectQuery = callback(dataSet.select());
      this.query.AddRelation(relation.query);
      return this;
    }

    public execute() {
        return this.query.execute(this.queryExecuter);
    }
}
