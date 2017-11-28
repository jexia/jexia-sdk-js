// tslint:disable:max-classes-per-file
import { CompositeFilteringCondition, FilteringCondition, ICondition } from "./filteringCondition";

class FieldFilter implements IFieldFilter {
  constructor(private fieldName: string) {}

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

export interface IFilteringCriterion {
  and(conditionToAdd: IFilteringCriterion): IFilteringCriterion;
  or(conditionToAdd: IFilteringCriterion): IFilteringCriterion;
}

export interface IFieldFilter {
  isGreaterThan(value: string): IFilteringCriterion;
  isLessThan(value: string): IFilteringCriterion;
  isEqualTo(value: string): IFilteringCriterion;
  isDifferentFrom(value: string): IFilteringCriterion;
  isEqualOrGreaterThan(value: string): IFilteringCriterion;
  isEqualOrLessThan(value: string): IFilteringCriterion;
  isNull(): IFilteringCriterion;
  isNotNull(): IFilteringCriterion;
  isInArray(values: string[]): IFilteringCriterion;
  isNotInArray(values: string[]): IFilteringCriterion;
  isLike(value: string): IFilteringCriterion;
  satisfiesRegexp(regexp: string): IFilteringCriterion;
  isBetween(start: string, end: string): IFilteringCriterion;
}

export function field(name: string): IFieldFilter {
  return new FieldFilter(name);
}

export function combineCriteria(criteria: IFilteringCriterion): IFilteringCriterion {
  return new FilteringCriterion(undefined, criteria as FilteringCriterion);
}
