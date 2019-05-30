import { MESSAGE } from "../../../config/message";
import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for select statements.
 * For TypeScript users it implements a generic type `T` that represents your dataset (defaults to `any`).
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *  .select()
 *  .where(field => field("title").isLike("test"))
 *  .execute();
 * ```
 *
 * @template T Generic type of your dataset, default to DatasetInterface<any>
 */
export class SelectQuery<T> extends FilterableQuery<T> {
  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, resourceType: ResourceType, resourceName: string) {
    super(queryExecuter, QueryAction.select, resourceType, resourceName);
  }

  /**
   * Limit the operation for the first n records
   * @param limit number limit records amount
   */
  public limit(limit: number): this {
    this.query.limit = limit;
    return this;
  }

  /**
   * Offset selection with the offset records
   * @param offset number offset amount
   */
  public offset(offset: number): this {
    this.query.offset = offset;
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
    this.query.addSortCondition("asc", ...(Array.isArray(field) ? field : field && [field, ...fields]));
    return this;
  }

  /**
   * Sort decedent the response that will represent the affected data
   * @param fields fields names to sort with
   */
  public sortDesc<K extends Extract<keyof T, string>>(fields: K[]): this;
  public sortDesc<K extends Extract<keyof T, string>>(...fields: K[]): this;
  public sortDesc<K extends Extract<keyof T, string>>(field: K, ...fields: K[]): this {
    if (!field || field.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.query.addSortCondition("desc", ...(Array.isArray(field) ? field : field && [field, ...fields]));
    return this;
  }
}
