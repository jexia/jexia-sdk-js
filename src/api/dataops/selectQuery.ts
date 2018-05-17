import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { Dataset, DefaultDatasetFields } from "./dataset";
import { FieldFilter, IFilteringCriterion, IFilteringCriterionCallback } from "./filteringApi";
import { IExecutable, IFields, IFilterable, ILimit, IOffset, IRelational, ISortable } from "./query.interfaces";

/**
 * Query object specialized for select statements.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object is generated automatically from the Dataset object, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * const posts = dataModule.dataset("posts");
 * posts.select()
 *  .where(field => field("title").isLike("test"))
 *  .execute()
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class SelectQuery<T = any>
  implements IFields, ILimit, IOffset, IFilterable, IExecutable, IRelational, ISortable {

  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    this.request = new DataRequest("select", dataset);
    this.queryExecuter = queryExecuter;
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
   * Filter the dataset records with some conditions against a related dataset
   * @param dataSet name of the related dataset
   * @param callback callback that returns the select query for the related dataset
   */
  public relation<R>(
    dataSet: Dataset<R>,
    callback: (query: SelectQuery<R>) => SelectQuery<R> = (q) => q,
  ): this {
    let relation = callback(dataSet.select());
    this.request.Query.AddRelation(relation.request.Query);
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
