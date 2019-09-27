import { IFilteringCriterion, IFilteringCriterionCallback, toFilteringCriterion } from "../api/core/filteringApi";
import { ICondition } from "../api/core/filteringCondition";
import { MESSAGE } from "../config";
import { QueryActionType, QueryParam, toQueryParams } from "./utils";

/* Sort direction
 */
export type Direction = "asc" | "desc";

/**
 * @internal
 */
type KeyOfObject<T> = Extract<keyof T, string>;

/**
 * Object to be passed as aggregation field
 * <T> - generic resource object
 */
export interface IAggField<T = any> {
  fn: "COUNT" | "MIN" | "MAX" | "AVG" | "SUM" | "EVERY";
  col: KeyOfObject<T> | "*";
}

/* Data sorting
 * list of fields + direction
 */
interface ISort<K> {
  fields: K[];
  direction: Direction;
}

/* Array of data sorting
   fields should be in inherited generic resource model (if it's been set)
 */
type SortedFields<T> = Array<ISort<KeyOfObject<T>>>;

export interface ICompiledQuery<T> {
  action: QueryActionType;
  action_resource: string;
  action_cond: Array<object>;
  cond: Array<object>;
  outputs: string[];
  order: SortedFields<T>;
  range: { limit?: number, offset?: number };
  relations: {[key: string]: Partial<ICompiledQuery<T>>};
}

export class Query<T = any> {
  public fields: Array<KeyOfObject<T> | IAggField<T>> = [];
  public limit: number;
  public offset: number;

  private filteringConditions: ICondition;
  private orders: SortedFields<T> = [];
  private actionParams: {
    action: QueryActionType;
    actionResource: string;
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>;
  };

  /*
   * This method is here to encapsulate the translation of filter settings
   * between the API layer of the SDK (IFilteringCriterion) and the internal
   * logic for compiling filters into JSON (ICondition).
   */
  public setFilterCriteria(filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>): void {
    this.filteringConditions = toFilteringCriterion(filter).condition;
  }

  public addSortCondition<K extends Extract<keyof T, string>>(direction: Direction, ...fields: K[]) {
    if (fields.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.orders.push({ fields, direction });
  }
  /**
   * Sets an action to the current query (e.g. ATTACH/DETACH)
   * @param   action The query action type
   * @param   actionResource The name of the resource
   * @param   filter An optional filter which condition will be applied to the resource.
   * @returns void
   */
  public setAction(
    action: QueryActionType,
    actionResource: string,
    filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ): void {
    this.actionParams = { action, actionResource, filter };
  }

  /* Collect all conditionals inside one object
   * to pass it to the API. Some conditionals can be skipped
   */
  public compile(): Partial<ICompiledQuery<T>> {
    const compiledQueryOptions: Partial<ICompiledQuery<T>> = {};

    /* Compile conditions
     */
    if (this.filteringConditions) {
      compiledQueryOptions.cond = this.filteringConditions.compile();
    }

    /* Compile limit and offset options
     */
    if (this.limit || this.offset) {
      compiledQueryOptions.range = {
        ...this.limit ? { limit: this.limit } : {},
        ...this.offset ? { offset: this.offset } : {},
      };
    }

    /* Compile fields
     */
    if (this.fields.length) {
      compiledQueryOptions.outputs = this.fields.map(
        (field) => typeof field === "object" ? this.compileAggregation(field) : field
      );
    }

    /* Compile sort options
     */
    if (this.orders.length) {
      compiledQueryOptions.order = this.orders;
    }

    if (this.actionParams) {
      const { action, actionResource, filter } = this.actionParams;
      compiledQueryOptions.action = action;
      compiledQueryOptions.action_resource = actionResource;
      compiledQueryOptions.action_cond = toFilteringCriterion(filter).condition.compile();
    }

    return compiledQueryOptions;
  }

  /**
   * Gets the compiled query transformed into query params format.
   *
   * @returns QueryParams[]
   */
  public compileToQueryParams(): QueryParam[] {
    const compiled = this.compile();
    const params = [];

    if (compiled.order) {
      // order should be multiple key/value entries instead of a single order=[]
      params.push(
        ...compiled.order.map((value: any) => ({ key: "order", value }))
      );
    }

    const { order, ...compiledWithNoOrder } = compiled;

    return params.concat(toQueryParams(compiledWithNoOrder));
  }

  /**
   * Compile aggregation object to the string
   * for COUNT function replace asterisk with i field
   * @param {IAggField} agg an aggregation object
   * @returns {string} compiled aggregation function
   */
  private compileAggregation(agg: IAggField): string {
    if (agg.fn === "COUNT" && agg.col === "*") {
      agg.col = "id";
    } else if (agg.col === "*") {
      throw new Error(`Field name should be provided with the ${agg.fn} function`);
    }
    return `${agg.fn}(${agg.col})`;
  }
}
