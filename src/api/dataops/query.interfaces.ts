import { Dataset } from "jexia-sdk-js/api/dataops/dataset";
import { IFilteringCriterion } from "jexia-sdk-js/api/dataops/filteringApi";

/**
 * @internal
 */
export interface IFields<T> {
  fields<K extends keyof T>(fields: K[]): this;
  fields<K extends keyof T>(...fields: K[]): this;
  fields<K extends keyof T>(field: K, ...fields: K[]): this;
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
export interface ISortable<T> {
  sortAsc<K extends keyof T>(fields: K[]): this;
  sortAsc<K extends keyof T>(...fields: K[]): this;
  sortAsc<K extends keyof T>(field: K, ...fields: K[]): this;
  sortDesc<K extends keyof T>(fields: K[]): this;
  sortDesc<K extends keyof T>(...fields: K[]): this;
  sortDesc<K extends keyof T>(field: K, ...fields: K[]): this;
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
