import { RequestExecuter } from "../../../internal/executer";
import { Query } from "../../../internal/query";
import { compileDataRequest } from "../../../internal/queryBasedCompiler";

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
 * @template T Generic type of dataset, inhereted from dataset object
 */
export abstract class BaseQuery<T> {
  /**
   * Used for INSERT query. Should be in base class by the reason of
   * execute() method takes it here
   */
  protected records: T[];

  /**
   * @internal
   */
  protected query: Query;

  constructor(
      protected queryExecuter: RequestExecuter,
      private readonly action: QueryAction,
      readonly dataset: string,
  ) {
    this.query = new Query<T>(dataset);
  }

  /**
   * Select the fields to be returned at the response that represent the affected data
   * @param fields fields names
   */
  public fields<K extends Extract<keyof T, string>>(fields: K[]): this;
  public fields<K extends Extract<keyof T, string>>(...fields: K[]): this;
  public fields<K extends Extract<keyof T, string>>(field: K, ...fields: K[]): this {
    this.query.Fields = Array.isArray(field) ? field : [field, ...fields];
    return this;
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   */
  public execute(): Promise<T[]> {

    /* Compile request */
    const compiledRequest = compileDataRequest({
      action: this.action,
      query: this.query,
      records: this.records,
    });

    /* if it is a select request and it has no query conditions
        call record (rest) API, otherwise use query API
     */
    if (compiledRequest.action === QueryAction.select && !compiledRequest.params) {
      return this.queryExecuter.executeRestRequest();
    } else {
      return this.queryExecuter.executeQueryRequest(compiledRequest);
    }
  }
}
