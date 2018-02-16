import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { DefaultDatasetFields } from "./dataset";
import { FieldFilter, IFilteringCriterion, IFilteringCriterionCallback } from "./filteringApi";
import { IExecutable, IFilterable, ILimit, IOffset, ISortable } from "./queryInterfaces";

export class UpdateQuery<T = any> implements ILimit, IOffset, IFilterable, IExecutable, ISortable {
  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, data: T, dataset: string) {
    this.request = new DataRequest("update", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Query.Data = data;
  }
  public limit(limit: number): this {
    this.request.Query.Limit = limit;
    return this;
  }
  public offset(offset: number): this {
    this.request.Query.Offset = offset;
    return this;
  }
  public where<K extends keyof T>(
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T, K>): this {
    this.request.Query.setFilterCriteria(
      typeof filter === "function" ?
        filter((field) => new FieldFilter<T, K>(field)) :
        filter,
    );
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

  public execute(): Promise<T[]> {
    return this.request.execute(this.queryExecuter);
  }
}
