import { RequestExecuter } from "../../../internal/executer";
import { IAggField, Query } from "../../../internal/query";
import { IRequestExecuterData } from "./../../../internal/executer.interfaces";

/**
 * @internal
 */
export enum QueryAction {
  select = "select",
  insert = "insert",
  update = "update",
  delete = "delete",
}

/**
 * Base class for SELECT, INSERT, UPDATE and DELETE queries. Implements fields to be returned
 * and execute method (things that shared for all query types)
 *
 * Can't be instantiated directly, must be extended by
 * the all kinds of queries
 *
 * @template T Generic type of dataset, inherited from dataset object
 */
export abstract class BaseQuery<T> {
  /**
   * @internal
   */
  protected query: Query<T>;
  /**
   * Body of request
   * @returns T | T[]
   */
  protected abstract get body(): T | T[] | null;

  protected constructor(
      protected queryExecuter: RequestExecuter,
      protected readonly action: QueryAction,
      readonly dataset: string,
  ) {
    this.query = new Query<T>(dataset);
  }

  /**
   * Select the fields to be returned at the response that represent the affected data
   * Aggregation functions can be provided as an object:
   * { fn: aggFn, col: string }
   * @param fields fields names or aggregation object
   */
   public fields(fields: Array<Extract<keyof T, string> | IAggField<T>>): this;
   public fields(...fields: Array<Extract<keyof T, string> | IAggField<T>>): this;
   public fields<K extends Extract<keyof T, string>>(field: K | IAggField<T>,
                                                     ...fields: Array<K | IAggField<T>>): this {
     this.query.fields = Array.isArray(field) ? field : [field, ...fields];
     return this;
   }

  /**
   * Prepare compiled request before execute it
   * @returns {IRequestExecuterData}
   */
  private get compiledRequest(): IRequestExecuterData {
    const compiledQuery = this.query.compile();

    return {
      action: this.action,
      body: this.body || {},
      queryParams: compiledQuery,
    };
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   */
  public execute(): Promise<T[]> {
    return this.queryExecuter.executeRequest(this.compiledRequest);
  }
}
