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
  private logicalOperatorType: LogicalOperator =  "and";

  constructor(
    readonly field: string,
    readonly operator: string,
    readonly value: U[] | U,
  ) { }

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
    this.appendCondition(condition, "or");
    return this;
  }

  public and(condition: ICondition): CompositeFilteringCondition {
    this.appendCondition(condition, "and");
    return this;
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

  private appendCondition(condition: ICondition, operator: LogicalOperator): void {
    const newCondition = clone(condition); // do not mutate original condition object
    newCondition.type = operator;

    this.conditions.push(newCondition);
  }
}
