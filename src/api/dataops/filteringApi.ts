// tslint:disable:max-classes-per-file
import { DefaultDatasetFields } from "jexia-sdk-js/api/dataops/dataset";
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";

/**
 * @internal
 */
export class FieldFilter<T, K extends keyof T> implements IFieldFilter {
  constructor(private fieldName: K | DefaultDatasetFields) {}

  public isGreaterThan(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, ">", [value]));
  }

  public isLessThan(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "<", [value]));
  }

  public isEqualTo(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "=", [value]));
  }

  public isDifferentFrom(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "<>", [value]));
  }

  public isEqualOrGreaterThan(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, ">=", [value]));
  }

  public isEqualOrLessThan(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "<=", [value]));
  }

  public isNull(): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "IS_NULL", []));
  }

  public isNotNull(): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "IS_NOT_NULL", []));
  }

  public isInArray(values: string[]): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "IN", values));
  }

  public isNotInArray(values: string[]): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "NOT_IN", values));
  }

  public isLike(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "LIKE", [value]));
  }

  public satisfiesRegexp(regexp: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "REGEXP", [regexp]));
  }

  public isBetween(start: string, end: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "BETWEEN", [start, end]));
  }
}

/**
 * @internal
 */
class FilteringCriterion implements IFilteringCriterion {
  private lowLevelCondition: ICondition;

  constructor(lowLevelCondition?: ICondition, highLevelCriteria?: FilteringCriterion) {
    if (lowLevelCondition) {
      this.lowLevelCondition = lowLevelCondition;
    }
    if (highLevelCriteria) {
      this.lowLevelCondition = new CompositeFilteringCondition(highLevelCriteria.lowLevelCondition, "AND");
    }
    if (!this.lowLevelCondition) {
      throw new Error("No information was given when constructing a FilteringCriterion.");
    }
  }

  public and(conditionToAdd: FilteringCriterion): FilteringCriterion {
    return new FilteringCriterion(this.lowLevelCondition.and(conditionToAdd.lowLevelCondition));
  }

  public or(conditionToAdd: FilteringCriterion): FilteringCriterion {
    return new FilteringCriterion(this.lowLevelCondition.or(conditionToAdd.lowLevelCondition));
  }
}

/**
 * Base interface for filtering criteria combination
 * @template T Generic type of your dataset, default to any
 */
export interface IFilteringCriterion<T = any> {
  /**
   * Combine the current filtering criteria with the next one in `and` mode.
   */
  and(conditionToAdd: IFilteringCriterion<T>): IFilteringCriterion<T>;
  /**
   * Combine the current filtering criteria with the next one in `or` mode.
   */
  or(conditionToAdd: IFilteringCriterion<T>): IFilteringCriterion<T>;
}

/**
 * Base interface for filtering by a dataset field
 *
 * @example
 * ```typescript
 * import { field } from "jexia-sdk-js/node";
 * const criterion = field("username").isEqualTo("Tom").or(field("username").isEqualTo("Dick"));
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export interface IFieldFilter<T = any> {
  /**
   * This field should be greater then the given value
   */
  isGreaterThan(value: string): IFilteringCriterion<T>;
  /**
   * This field should be lesser then the given value
   */
  isLessThan(value: string): IFilteringCriterion<T>;
  /**
   * This field should be equal to the given value
   */
  isEqualTo(value: string): IFilteringCriterion<T>;
  /**
   * This field should be different the given value
   */
  isDifferentFrom(value: string): IFilteringCriterion<T>;
  /**
   * This field should be equal or greater the given value
   */
  isEqualOrGreaterThan(value: string): IFilteringCriterion<T>;
  /**
   * This field should be equal of lesser then the given value
   */
  isEqualOrLessThan(value: string): IFilteringCriterion<T>;
  /**
   * This field should be null
   */
  isNull(): IFilteringCriterion<T>;
  /**
   * This field should be not null
   */
  isNotNull(): IFilteringCriterion<T>;
  /**
   * This field should have one of the given values
   */
  isInArray(values: string[]): IFilteringCriterion<T>;
  /**
   * This field should not have any of the given values
   */
  isNotInArray(values: string[]): IFilteringCriterion<T>;
  /**
   * This field should be contain the given value
   */
  isLike(value: string): IFilteringCriterion<T>;
  /**
   * This field should be satisfies the given regexp
   */
  satisfiesRegexp(regexp: string): IFilteringCriterion<T>;
  /**
   * This field should be in between these given values
   */
  isBetween(start: string, end: string): IFilteringCriterion<T>;
}

/**
 * Starts a filtering criteria for a given field
 * @param name Field name to be filtered
 * @template T Generic type of your dataset, default to any
 */
export function field<T = any>(name: string): IFieldFilter {
  return new FieldFilter<T, any>(name);
}

/**
 * Callback to generate a filtering criteria
 * @argument filter Filtering criteria for a given field
 * @argument field Field name to be filtered
 * @template T Generic type of your dataset, default to any
 * @template K Keys of the of your dataset, default to any
 */
export type IFilteringCriterionCallback<T, K extends keyof T> =
  (filter: (field: K | DefaultDatasetFields) => IFieldFilter<T>) => IFilteringCriterion<T>;

/**
 * Starts a filtering criteria combination with a filtering criteria
 * @param criteria A filtering criteria
 */
export function combineCriteria(criteria: IFilteringCriterion): IFilteringCriterion {
  return new FilteringCriterion(undefined, criteria as FilteringCriterion);
}
