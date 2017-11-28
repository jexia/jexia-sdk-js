import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { Dataset } from "./dataset";
import { IFilteringCriterion } from "./filteringApi";
import { IExecutable, IFields, IFilterable, ILimit, IOffset, IRelational, ISortable } from "./queryInterfaces";

export class SelectQuery implements IFields, ILimit, IOffset, IFilterable, IExecutable, IRelational, ISortable {
  private request: DataRequest;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    this.request = new DataRequest("select", dataset);
    this.queryExecuter = queryExecuter;
  }

  public fields(...fields: string[]): SelectQuery {
    this.request.Query.Fields = fields;
    return this;
  }

  public limit(limit: number): SelectQuery {
    this.request.Query.Limit = limit;
    return this;
  }

  public offset(offset: number): SelectQuery {
    this.request.Query.Offset = offset;
    return this;
  }

  public where(filter: IFilteringCriterion): SelectQuery {
    this.request.Query.setFilterCriteria(filter);
    return this;
  }

  public sortAsc(...fields: string[]): SelectQuery {
    this.request.Query.AddSortCondition("asc", ...fields);
    return this;
  }
  public sortDesc(...fields: string[]): SelectQuery {
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
