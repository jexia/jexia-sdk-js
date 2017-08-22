import { ICondition } from "./filteringCondition";

interface ISort {
  fields: string[];
  direction: string;
}

export class Query {
  private dataSet: string;
  private fields: string[];
  private limit: number;
  private offset: number;
  private filteringConditions: ICondition;
  private orders: ISort[];
  private relations: Query[];
  private data: object;

  constructor(dataSet: string) {
    this.dataSet = dataSet;
    this.orders = [];
    this.relations = [];
  }

  public set Data(data: object){
    this.data = data;
  }

  public get Data(): object {
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

  public set Filter(filter: ICondition){
    this.filteringConditions = filter;
  }

  public get Filter() {
    return this.filteringConditions;
  }

  public get Relations(): Query[] {
    return this.relations;
  }

  public AddSortCondition(direction: string, ...fields: string[]) {
    this.orders.push({ fields, direction });
  }

  public get SortOrders(): Array<object> {
    return this.orders;
  }

  public AddRelation(relation: Query): void {
    this.relations.push(relation);
  }
}
