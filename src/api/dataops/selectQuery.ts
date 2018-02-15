import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { Dataset, DefaultDatasetFields } from "./dataset";
import { IFilteringCriterion } from "./filteringApi";
import { IExecutable, IFields, IFilterable, ILimit, IOffset, IRelational, ISortable } from "./queryInterfaces";

export class SelectQuery<T = any>
  implements IFields, ILimit, IOffset, IFilterable, IExecutable, IRelational, ISortable {

  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    this.request = new DataRequest("select", dataset);
    this.queryExecuter = queryExecuter;
  }

  public fields<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.Fields = fields;
    return this;
  }

  public limit(limit: number): this {
    this.request.Query.Limit = limit;
    return this;
  }

  public offset(offset: number): this {
    this.request.Query.Offset = offset;
    return this;
  }

  public where(filter: IFilteringCriterion): this {
    this.request.Query.setFilterCriteria(filter);
    return this;
  }

  public sortAsc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.AddSortCondition("asc", ...fields);
    return this;
  }
  public sortDesc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.AddSortCondition("desc", ...fields);
    return this;
  }

  // tslint:disable-next-line:max-line-length
  public relation(dataSet: Dataset, callback: (query: SelectQuery) => SelectQuery = (q: SelectQuery) => q): this {
    let relation: SelectQuery = callback(dataSet.select());
    this.request.Query.AddRelation(relation.request.Query);
    return this;
  }

  public execute(): Promise<T[]> {
    return this.request.execute(this.queryExecuter);
  }
}
