import { Dataset, DatasetInterface } from "../../dataops/dataset";
import { FieldFilter, IFilteringCriterion, IFilteringCriterionCallback } from "../../dataops/filteringApi";
import { BaseQuery } from "./baseQuery";
import { SelectQuery } from "./selectQuery";

/**
 * Extend `BaseQuery` and overrides `where()` and `relation()` methods. Used by `SELECT`, `UPDATE` and `DELETE` queries.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *   .select()
 *   .where(filter => filter("date").isLessThan(lastDate))
 *   .relation("authors", query => query.where(filter => filter("age").isGreaterThan(minAge)))
 *   .execute();
 * ```
 */
export abstract class FilterableQuery<T> extends BaseQuery<T> {
  /**
   * @internal
   */
  protected readonly body: T | null = null;

  /**
   * Filter the dataset rows with some conditions where the operation will be applied
   * @param filter Filtering criteria or a callback that returns a filtering criteria with the conditions
   */
  public where(
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>): this {
    this.query.setFilterCriteria(
      typeof filter === "function" ?
        filter((field) => new FieldFilter(field)) :
        filter,
    );
    return this;
  }

  /**
   * Filter the dataset records with some conditions against a related dataset
   * @param dataSet name of the related dataset
   * @param callback callback that returns the select query for the related dataset
   */
  public relation<R extends object>(
    dataSet: Dataset<R>,
    callback: (query: SelectQuery<DatasetInterface<R>>) => SelectQuery<DatasetInterface<R>> = (q) => q,
  ): this {
    throw new Error("Relations are not supported in current version of SDK");
  }
}
