// tslint:disable:max-classes-per-file
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";
import { ResourceInterface } from "./resource";

/**
 * This object must be build from `field` helper function, never to be instantiated directly.
 */
export class FieldFilter<U> {
  constructor(public readonly fieldName: string) {}

  public isGreaterThan(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, ">", value));
  }

  public isLessThan(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "<", value));
  }

  public isEqualTo(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "=", value));
  }

  public isDifferentFrom(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "!=", value));
  }

  public isEqualOrGreaterThan(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, ">=", value));
  }

  public isEqualOrLessThan(value: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "<=", value));
  }

  public isNull(): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "null", true));
  }

  public isNotNull(): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "null", false));
  }

  public isInArray(values: U[]): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "in", values));
  }

  public isNotInArray(values: U[]): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "not in", values));
  }

  public isLike(value: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "like", value));
  }

  public satisfiesRegex(regex: string): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "regex", regex));
  }

  public isBetween(start: U, end: U): IFilteringCriterion {
    return new FilteringCriterion(new FilteringCondition(this.fieldName, "between", [start, end]));
  }
}

/**
 * @internal
 */
export class FilteringCriterion implements IFilteringCriterion {
  private lowLevelCondition: ICondition;

  constructor(lowLevelCondition?: ICondition, highLevelCriteria?: FilteringCriterion) {
    if (lowLevelCondition) {
      this.lowLevelCondition = lowLevelCondition;
    }
    if (highLevelCriteria) {
      this.lowLevelCondition = new CompositeFilteringCondition(highLevelCriteria.lowLevelCondition, "and");
    }
    if (!this.lowLevelCondition) {
      throw new Error("No information was given when constructing a FilteringCriterion.");
    }
  }

  public get condition(): ICondition {
    return this.lowLevelCondition;
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
   * The filtering condition object
   */
  readonly condition: ICondition;
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
 * Starts a filtering criteria for a given field
 * @param name Field name to be filtered
 * @template T Generic type of your dataset, default to any
 * @template K Generic name of the dataset field you want to filter by
 */
export function field<T = ResourceInterface<any>, K extends Extract<keyof ResourceInterface<T>, string> = any>(name: K):
  FieldFilter<ResourceInterface<T>[K]> {
  return new FieldFilter<ResourceInterface<T>[K]>(name);
}

/**
 * Callback to generate a filtering criteria
 * @argument filter Filtering criteria for a given field
 * @argument field Field name to be filtered
 * @template T Generic type of your dataset, default to any
 * @template K Keys of the of your dataset, default to any
 */
export type IFilteringCriterionCallback<T> =
  (filter: <K extends Extract<keyof T, string>>(field: K) => FieldFilter<T[K]>) => IFilteringCriterion<T>;

/**
 * Starts a filtering criteria combination with a filtering criteria
 * @param criteria A filtering criteria
 */
export function combineCriteria(criteria: IFilteringCriterion): IFilteringCriterion {
  return new FilteringCriterion(undefined, criteria as FilteringCriterion);
}

/**
 * Gets a IFilteringCriterion whether the given filter it's a callback or a IFilteringCriterion itself.
 * @param   filter Filtering criteria or a callback that returns a filtering criteria
 * @returns IFilteringCriterion The filtering criterion
 */
export function toFilteringCriterion<T>(
  filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
): IFilteringCriterion<T> {
  return typeof filter === "function"
    ? filter((f) => new FieldFilter(f))
    : filter;
}
