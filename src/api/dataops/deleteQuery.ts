import { MESSAGE } from "../../config/message";
import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
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
export class DeleteQuery<T = any> implements IFields<T>, ILimit, IOffset, IFilterable, IExecutable, ISortable<T> {

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
  public fields<K extends Extract<keyof T, string>>(fields: K[]): this;
  public fields<K extends Extract<keyof T, string>>(...fields: K[]): this;
  public fields<K extends Extract<keyof T, string>>(field: K, ...fields: K[]): this {
    this.request.Query.Fields = Array.isArray(field) ? field : [field, ...fields];
    return this;
  }

  /**
   * Limit the operation for the first n records
   * @param limit number limit records amount
   */
  public limit(limit: number): this {
    this.request.Query.Limit = limit;
    return this;
  }

  /**
   * Offset selection with the offset records
   * @param offset number offset amount
   */
  public offset(offset: number): this {
    this.request.Query.Offset = offset;
    return this;
  }

  /**
   * Filter the dataset rows with some conditions where the operation will be applied
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
  public sortAsc<K extends Extract<keyof T, string>>(fields: K[]): this;
  public sortAsc<K extends Extract<keyof T, string>>(...fields: K[]): this;
  public sortAsc<K extends Extract<keyof T, string>>(field: K, ...fields: K[]): this {
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
  public sortDesc<K extends Extract<keyof T, string>>(fields: K[]): this;
  public sortDesc<K extends Extract<keyof T, string>>(...fields: K[]): this;
  public sortDesc<K extends Extract<keyof T, string>>(
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
