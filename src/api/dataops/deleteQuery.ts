import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { DefaultDatasetFields } from "./dataset";
import { FieldFilter, IFilteringCriterion, IFilteringCriterionCallback } from "./filteringApi";
import { IExecutable, IFields, IFilterable, ILimit, IOffset, ISortable } from "./query.interfaces";

/**
 * Query object specialized for delete statements.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object is generated automatically from the Dataset object, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * const posts = dataModule.dataset("posts");
 * posts.delete()
 *  .where(field => field("title").isLike("test"))
 *  .execute()
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class DeleteQuery<T = any> implements IFields, ILimit, IOffset, IFilterable, IExecutable, ISortable {

  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    this.request = new DataRequest("delete", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Action = "delete";
  }

  /**
   * Select the fields to be returned at the response that represent the affected data
   * @param fields fields names
   */
  public fields<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.Fields = fields;
    return this;
  }

  /**
   * Limit the operation for the first n records
   * @param fields fields names
   */
  public limit(limit: number): this {
    this.request.Query.Limit = limit;
    return this;
  }

  /**
   * Limit the operation for the last n records
   * @param fields fields names
   */
  public offset(offset: number): this {
    this.request.Query.Offset = offset;
    return this;
  }

  /**
   * Filter the dataset rows with some conditions where the operation will be applied
   * @param filter Filtering criteria or a callback that returns a filtering criteria with the conditions
   */
  public where<K extends keyof T>(
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T, K>): this {
    this.request.Query.setFilterCriteria(
      typeof filter === "function" ?
        filter((field) => new FieldFilter<T, K>(field)) :
        filter,
    );
    return this;
  }

  /**
   * Sort ascendent the response that will represent the affected data
   * @param fields fields names to sort with
   */
  public sortAsc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.AddSortCondition("asc", ...fields);
    return this;
  }

  /**
   * Sort decedent the response that will represent the affected data
   * @param fields fields names to sort with
   */
  public sortDesc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this {
    this.request.Query.AddSortCondition("desc", ...fields);
    return this;
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   */
  public execute(): Promise<T[]> {
    return this.request.execute(this.queryExecuter);
  }
}
