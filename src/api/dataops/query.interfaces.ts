import { Dataset } from "jexia-sdk-js/api/dataops/dataset";
import { DefaultDatasetFields } from "jexia-sdk-js/api/dataops/dataset";
import { IFilteringCriterion } from "jexia-sdk-js/api/dataops/filteringApi";

/**
 * @internal
 */
export interface IFields<T> {
  fields<K extends keyof T>(fields: Array<K | DefaultDatasetFields>): this;
  fields<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this;
  fields<K extends keyof T>(field: K | DefaultDatasetFields, ...fields: Array<K | DefaultDatasetFields>): this;
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
  sortAsc<K extends keyof T>(fields: Array<K | DefaultDatasetFields>): this;
  sortAsc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this;
  sortAsc<K extends keyof T>(field: K | DefaultDatasetFields, ...fields: Array<K | DefaultDatasetFields>): this;
  sortDesc<K extends keyof T>(fields: Array<K | DefaultDatasetFields>): this;
  sortDesc<K extends keyof T>(...fields: Array<K | DefaultDatasetFields>): this;
  sortDesc<K extends keyof T>(field: K | DefaultDatasetFields, ...fields: Array<K | DefaultDatasetFields>): this;
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
