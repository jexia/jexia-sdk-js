import { Dataset } from "./dataset";
import { IFilteringCriterion } from "./filteringApi";

export interface IFields {
  fields(...fields: string[]): IFields;
}

export interface ILimit {
  limit(limit: number): ILimit;
}

export interface IOffset {
  offset(offset: number): IOffset;
}

export interface IFilterable {
  where(filter: IFilteringCriterion): IFilterable;
}

export interface ISortable {
  sortAsc(...fields: string[]): ISortable;
  sortDesc(...fields: string[]): ISortable;
}

export interface IExecutable {
  execute(): Promise<any>;
}

export interface IRelational {
  relation( dataSet: Dataset, callback?: (query: IRelational) => IRelational ): IRelational;
}
