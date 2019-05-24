// tslint:disable:max-classes-per-file

/**
 * @internal
 */
export interface ICondition {
  type: LogicalOperator;
  or(condition: ICondition): ICondition;
  and(condition: ICondition): ICondition;

  compile(): object;
}

/**
 * @internal
 */
export type LogicalOperator = "and" | "or";

/**
 * @internal
 */
export class FilteringCondition<U> implements ICondition {
  private field: string;
  private operator: string;
  private values: U[];
  private logicalOperatorType: LogicalOperator;

  constructor(field: string, operator: string, values: U[]) {
    this.logicalOperatorType = "and";
    this.field = field;
    this.operator = operator;
    this.values = values;
  }

  public get type(): LogicalOperator {
    return this.logicalOperatorType;
  }

  public set type(type: LogicalOperator) {
    this.logicalOperatorType = type;
  }

  public or(condition: ICondition): CompositeFilteringCondition {
    return new CompositeFilteringCondition(this, "and").or(condition);
  }

  public and(condition: ICondition): CompositeFilteringCondition {
    return new CompositeFilteringCondition(this, "and").and(condition);
  }

  public compile() {
    return { field: this.field, operator: this.operator, values: this.values, type: this.Type };
  }
}

/**
 * @internal
 */
export class CompositeFilteringCondition implements ICondition {
  private logicalOperatorType: LogicalOperator;
  private conditions: ICondition[];

  constructor(filteringCondition: ICondition, logicalOperatorType: string) {
    this.conditions = [];
    this.conditions.push(filteringCondition);
    this.logicalOperatorType = logicalOperatorType;
  }

  public get type(): LogicalOperator {
    return this.logicalOperatorType;
  }

  public set type(type: LogicalOperator) {
    this.logicalOperatorType = type;
  }

  public or(condition: ICondition): CompositeFilteringCondition {
    condition.Type = "or";
    this.conditions.push(condition);
    return this;
  }

  public and(condition: ICondition): CompositeFilteringCondition {
    condition.Type = "and";
    this.conditions.push(condition);
    return this;
  }

  public compile() {
    return {
      conditions: this.conditions.map( (condition: ICondition) => condition.compile()),
      type: this.logicalOperatorType,
     };
  }
}
