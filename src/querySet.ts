import { QueryBasedCompiler } from "./compiler/queryBasedCompiler";
import { ICondition } from "./filteringCondition";
import { QueryExecuter } from "./queryExecuter";

interface ISort {
    fields: string[];
    direction: string;
}
export class QuerySet {
    private action: string;
    private fields: string[];
    private limit: number;
    private offset: number;
    private filteringConditions: ICondition;
    private orders: Array<object>;
    private data: object;
    private relations: QuerySet[];
    private records: Array<object>;

    public set Action(action: string){
        this.action = action;
    }

    public get Action(): string {
        return this.action;
    }

    public set Records(records: Array<object>){
        this.records = records;
    }

    public get Records(): Array<object> {
        return this.records;
    }

    public set Data(data: object){
        this.data = data;
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

    public get Relations(): QuerySet[] {
      return this.relations;
    }

    public AddSortCondition(direction: string, ...fields: string[]) {
        if (this.orders == null) {
            this.orders = [];
        }
        let sortObj: ISort = { fields, direction };
        this.orders.push(sortObj);
    }

    public get SortOrders(): Array<object> {
      return this.orders;
    }

    public AddRelation(relation: QuerySet): void {
      this.relations.push(relation);
    }

    public execute(queryExecuter: QueryExecuter) {
        let compiler: QueryBasedCompiler = new QueryBasedCompiler(this);
        let queryParams: object;
        queryParams = compiler.compile();
        return queryExecuter.executeQuery(queryParams);
    }
}
