import { MESSAGE } from "../../config/message";
import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { FieldFilter, IFilteringCriterion, IFilteringCriterionCallback } from "./filteringApi";
import { IExecutable, IFilterable, ILimit, IOffset, ISortable } from "./query.interfaces";

/**
 * Query object specialized for update statements.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object is generated automatically from the Dataset object, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * const posts = dataModule.dataset("posts");
 * posts.delete({
 *    title: 'My Updated Title'
 *  })
 *  .where(field => field("title").isLike("old title"))
 *  .execute()
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class UpdateQuery<T = any> implements ILimit, IOffset, IFilterable, IExecutable, ISortable<T> {
  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, data: T, dataset: string) {
    this.request = new DataRequest("update", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Query.Data = data;
  }

  /**
   * Limit the operation for the first n records
   * @param limit quantity of records
   */
  public limit(limit: number): this {
    this.request.Query.Limit = limit;
    return this;
  }

  /**
   * Limit the operation for the last n records
   * @param offset quantity of records
   */
  public offset(offset: number): this {
    this.request.Query.Offset = offset;
    return this;
  }

  /**
   * Filter the dataset records with some conditions where the operation will be applied
   * @param filter Filtering criteria or a callback that returns a filtering criteria with the conditions
   */
  public where(
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>): this {
    this.request.Query.setFilterCriteria(
      typeof filter === "function" ?
        filter((field) => new FieldFilter(field)) :
        filter,
    );
    return this;
  }

  /**
   * Sort ascendent the response that will represent the affected data
   * @param fields fields names to sort with
   */
  public sortAsc<K extends keyof T>(fields: K[]): this;
  public sortAsc<K extends keyof T>(...fields: K[]): this;
  public sortAsc<K extends keyof T>(field: K, ...fields: K[]): this {
    if (!field || field.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.request.Query.AddSortCondition("asc", ...(Array.isArray(field) ? field : field && [field, ...fields]));
    return this;
  }

  /**
   * Sort decedent the response that will represent the affected data
   * @param fields fields names to sort with
   */
  public sortDesc<K extends keyof T>(fields: K[]): this;
  public sortDesc<K extends keyof T>(...fields: K[]): this;
  public sortDesc<K extends keyof T>(
    field: K, ...fields: K[]): this {
    if (!field || field.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.request.Query.AddSortCondition("desc", ...(Array.isArray(field) ? field : field && [field, ...fields]));
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
