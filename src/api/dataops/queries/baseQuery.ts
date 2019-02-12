import { RequestExecuter } from "../../../internal/executer";
import { IAggField, ICompiledQuery, Query } from "../../../internal/query";

interface ICompiledRequest<T> {
  action: QueryAction;
  params?: Partial<ICompiledQuery<T>>;
  records?: T[];
}

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
   * Used for INSERT query. Should be in base class by the reason of
   * compiledRequest getter takes it here
   */
  protected records: T[];

  /**
   * @internal
   */
  protected query: Query<T>;

  protected constructor(
      protected queryExecuter: RequestExecuter,
      private readonly action: QueryAction,
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
   * @template <T> Generic type of dataset model
   * @returns {ICompiledRequest<T>}
   */
  private get compiledRequest(): ICompiledRequest<T> {
    const compiledQuery = this.query.compile();

    if (this.records && !Object.keys(compiledQuery).length) {
      return Object.assign(this.records);
    }

    return Object.assign(
      { action: this.action },
      Object.keys(compiledQuery).length && { params: compiledQuery },
      this.records && { records: this.records },
    );
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   */
  public execute(): Promise<T[]> {
    return this.queryExecuter.executeRequest(this.compiledRequest);
  }
}
