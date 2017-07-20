import { Dataset } from "./dataset";
import { ICondition } from "./filteringCondition";

export interface IFields {
    fields(...fields: string[]): object;
}

export interface ILimit {
    limit(limit: number): object;
}

export interface IOffset {
    offset(offset: number): object;
}

export interface IFilter {
    filter(filter: ICondition): IFilter;
}

export interface ISort {
    sort(fields: string[], direction: string): object;
}

export interface IExecute {
    execute(): Promise<any>;
}

export interface IRelational {
  relation( dataSet: Dataset, callback: (query: IRelational) => IRelational ): IRelational;
}
