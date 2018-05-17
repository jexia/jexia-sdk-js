import { Dataset } from "jexia-sdk-js/api/dataops/dataset";
import { IFilteringCriterion } from "jexia-sdk-js/api/dataops/filteringApi";

/**
 * @internal
 */
export interface IFields {
  fields(...fields: string[]): IFields;
}

/**
 * @internal
 */
export interface ILimit {
  limit(limit: number): ILimit;
}

/**
 * @internal
 */
export interface IOffset {
  offset(offset: number): IOffset;
}

/**
 * @internal
 */
export interface IFilterable {
  where(filter: IFilteringCriterion): IFilterable;
}

/**
 * @internal
 */
export interface ISortable {
  sortAsc(...fields: string[]): ISortable;
  sortDesc(...fields: string[]): ISortable;
}

/**
 * @internal
 */
export interface IExecutable {
  execute(): Promise<any>;
}

/**
 * @internal
 */
export interface IRelational {
  relation( dataSet: Dataset, callback?: (query: IRelational) => IRelational ): IRelational;
}
