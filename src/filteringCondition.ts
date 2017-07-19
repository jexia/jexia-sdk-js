export interface ICondition {
  Type: string;
  or(condition: ICondition): ICondition;
  and(condition: ICondition): ICondition;

  compile(): object;
}

export class FilteringCondition implements ICondition {
  private field: string;
  private operator: string;
  private values: string[];
  private logicalOperatorType: string;

  constructor(field: string, operator: string, value: string) {
    this.logicalOperatorType = "and";
    this.field = field;
    this.operator = operator;
    this.values = [value];
  }

  public get Type(): string {
    return this.logicalOperatorType;
  }

  public set Type(type: string) {
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

// tslint:disable-next-line:max-classes-per-file
export class CompositeFilteringCondition implements ICondition {
  private logicalOperatorType: string;
  private conditions: ICondition[];

  constructor(filteringCondition: ICondition, logicalOperatorType: string) {
    this.conditions = [];
    this.conditions.push(filteringCondition);
    this.logicalOperatorType = logicalOperatorType;
  }

  public get Type(): string{
    return this.logicalOperatorType;
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
