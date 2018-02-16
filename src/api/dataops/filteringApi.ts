// tslint:disable:max-classes-per-file
import { DefaultDatasetFields } from "jexia-sdk-js/api/dataops/dataset";
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";

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

export interface IFilteringCriterion<T = any> {
  and(conditionToAdd: IFilteringCriterion<T>): IFilteringCriterion<T>;
  or(conditionToAdd: IFilteringCriterion<T>): IFilteringCriterion<T>;
}

export interface IFieldFilter<T = any> {
  isGreaterThan(value: string): IFilteringCriterion<T>;
  isLessThan(value: string): IFilteringCriterion<T>;
  isEqualTo(value: string): IFilteringCriterion<T>;
  isDifferentFrom(value: string): IFilteringCriterion<T>;
  isEqualOrGreaterThan(value: string): IFilteringCriterion<T>;
  isEqualOrLessThan(value: string): IFilteringCriterion<T>;
  isNull(): IFilteringCriterion<T>;
  isNotNull(): IFilteringCriterion<T>;
  isInArray(values: string[]): IFilteringCriterion<T>;
  isNotInArray(values: string[]): IFilteringCriterion<T>;
  isLike(value: string): IFilteringCriterion<T>;
  satisfiesRegexp(regexp: string): IFilteringCriterion<T>;
  isBetween(start: string, end: string): IFilteringCriterion<T>;
}

export function field<T = any>(name: string): IFieldFilter {
  return new FieldFilter<T, any>(name);
}

export interface IFilteringCriterionCallback<T, K extends keyof T> {
  (filter: (field: K | DefaultDatasetFields) => IFieldFilter<T>): IFilteringCriterion<T>;
}

export function combineCriteria(criteria: IFilteringCriterion): IFilteringCriterion {
  return new FilteringCriterion(undefined, criteria as FilteringCriterion);
}
