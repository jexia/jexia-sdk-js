import { IFilteringCriterion, IFilteringCriterionCallback, toFilteringCriterion } from "../../dataops/filteringApi";
import { BaseQuery } from "./baseQuery";

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
    this.query.setFilterCriteria(toFilteringCriterion(filter));
    return this;
  }
}
