import { clone } from "../../internal/utils";

// tslint:disable:max-classes-per-file

/**
 * @internal
 */
export interface ICondition {
  type: LogicalOperator;
  or(condition: ICondition): ICondition;
  and(condition: ICondition): ICondition;

  compile(): any[];
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
  private value: U[] | U;
  private logicalOperatorType: LogicalOperator;

  constructor(field: string, operator: string, value: U[] | U) {
    this.logicalOperatorType = "and";
    this.field = field;
    this.operator = operator;
    this.value = value;
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
    return [
      { field: this.field },
      this.operator,
      this.value,
    ];
  }
}

/**
 * @internal
 */
export class CompositeFilteringCondition implements ICondition {
  private logicalOperatorType: LogicalOperator;
  private conditions: ICondition[];

  constructor(filteringCondition: ICondition, logicalOperatorType: LogicalOperator) {
    this.conditions = [filteringCondition];
    this.logicalOperatorType = logicalOperatorType;
  }

  public get type(): LogicalOperator {
    return this.logicalOperatorType;
  }

  public set type(type: LogicalOperator) {
    this.logicalOperatorType = type;
  }

  public or(condition: ICondition): CompositeFilteringCondition {
    return this.appendCondition(condition, "or");
  }

  public and(condition: ICondition): CompositeFilteringCondition {
    return this.appendCondition(condition, "and");
  }

  public compile() {
    return this.conditions.reduce(this.toCompiledConditions, []);
  }

  private toCompiledConditions(expressions: any[], condition: ICondition) {
    const appendNestedConditions = () => {
      const compiledCondition = condition.compile();
      const SINGLE_CONDITION_LENGTH = 3;

      if (compiledCondition.length === SINGLE_CONDITION_LENGTH) {
        expressions.push(...compiledCondition);
      } else {
        expressions.push(compiledCondition);
      }

      return expressions;
    };

    if (expressions.length) {
      // append connector
      expressions.push(condition.type);
    }

    return appendNestedConditions();
  }

  private appendCondition(condition: ICondition, operator: LogicalOperator): this {
    const newCondition = clone(condition); // do not mutate original condition object
    newCondition.type = operator;

    this.conditions.push(newCondition);
    return this;
  }
}
