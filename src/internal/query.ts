import { IFilteringCriterion } from "../api/dataops/filteringApi";
import { ICondition } from "../api/dataops/filteringCondition";
import { MESSAGE } from "../config";

interface ISort {
  fields: string[];
  direction: string;
}

export class Query<T = any> {
  private fields: string[];
  private limit: number;
  private offset: number;
  private filteringConditions: ICondition;
  private orders: ISort[];
  private relations: Query[];
  private data: T;

  constructor(private readonly dataSet: string) {
    this.orders = [];
    this.relations = [];
  }

  public set Data(data: T){
    this.data = data;
  }

  public get Data(): T {
    return this.data;
  }

  public get Dataset(): string {
    return this.dataSet;
  }

  public set Fields(fields: string[]){
    this.fields = fields;
  }

  public get Fields(): string[] {
    return this.fields;
  }

  public set Limit(limit: number){
    this.limit = limit;
  }

  public get Limit(){
    return this.limit;
  }

  public set Offset(offset: number){
    this.offset = offset;
  }

  public get Offset(){
    return this.offset;
  }

  /*
   * This method is here to encapsulate the translation of filter settings
   * between the API layer of the SDK (IFilteringCriterion) and the internal
   * logic for compiling filters into JSON (ICondition).
   */
  public setFilterCriteria(filter: IFilteringCriterion) {
    this.filteringConditions = (filter as any).lowLevelCondition;
  }

  public set Filter(condition: ICondition) {
    this.filteringConditions = condition;
  }

  public get Filter(): ICondition {
    return this.filteringConditions;
  }

  public get Relations(): Query[] {
    return this.relations;
  }

  public AddSortCondition<K extends Extract<keyof T, string>>(direction: "asc" | "desc", ...fields: K[]) {
    if (fields.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.orders.push({ fields, direction });
  }

  public get SortOrders(): Array<object> {
    return this.orders;
  }

  public AddRelation(relation: Query): void {
    this.relations.push(relation);
  }
}
