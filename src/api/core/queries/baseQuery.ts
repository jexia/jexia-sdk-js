import { Observable } from "rxjs";
import { RequestExecuter } from "../../../internal/executer";
import { IRequestExecuterData } from "../../../internal/executer.interfaces";
import { IAggField, Query } from "../../../internal/query";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { ResourceType } from "../resource";

/**
 * Base class for SELECT, INSERT, UPDATE and DELETE queries. Implements fields to be returned
 * and execute method (things that shared for all query types)
 *
 * Can't be instantiated directly, must be extended by
 * the all kinds of queries
 *
 * @template T Generic type of dataset, inherited from dataset object
 * @template D Extended dataset type with default fields (i.e id, created_at, updated_at)
 */
export abstract class BaseQuery<T, D extends T = any> extends Observable<T[]> {
  /**
   * @internal
   */
  protected query: Query<T>;
  /**
   * Body of request
   * @returns T | T[]
   */
  protected abstract get body(): T | T[] | D | D[] | null;

  protected constructor(
      protected queryExecuter: RequestExecuter,
      protected readonly method: RequestMethod,
      protected readonly resourceType: ResourceType,
      protected readonly resourceName: string,
  ) {
    super((subscriber) => {
      this.queryExecuter.executeRequest(this.compiledRequest)
        .then((result: T[]) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch((reason) => subscriber.error(reason));
    });

    this.query = new Query<T>();
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
    return {
      resourceType: this.resourceType,
      resourceName: this.resourceName,
      method: this.method,
      body: this.body || {},
      queryParams: this.query.compileToQueryParams() || [],
    };
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   * @deprecated Use subscribe() instead
   */
  public execute(): Promise<T[]> {
    // tslint:disable:no-console
    console.warn("=============================================");
    console.warn(" execute() method is DEPRECATED.\n Please, consider using .subscribe() instead");
    console.warn("=============================================");
    return this.queryExecuter.executeRequest(this.compiledRequest);
  }
}
