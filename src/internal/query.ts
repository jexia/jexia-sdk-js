import { IFilteringCriterion } from "../api/dataops/filteringApi";
import { ICondition } from "../api/dataops/filteringCondition";
import { MESSAGE } from "../config";

/* Sort direction
 */
export type Direction = "asc" | "desc";

/**
 * @internal
 */
type KeyOfObject<T> = Extract<keyof T, string>;

/**
 * Object to be passed as aggregation field
 * <T> - generic dataset object
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
   fields should be in inherited generic dataset model (if it's been set)
 */
type SortedFields<T> = Array<ISort<KeyOfObject<T>>>;

export interface ICompiledQuery<T> {
  conditions: Array<object>;
  outputs: string[];
  order: SortedFields<T>;
  range: { limit?: number, offset?: number };
  relations: {[key: string]: Partial<ICompiledQuery<T>>};
}

export class Query<T = any> {
  public fields: Array<KeyOfObject<T> | IAggField<T>>;
  public limit: number;
  public offset: number;

  private filteringConditions: ICondition;
  private orders: SortedFields<T> = [];
  private relations: Query[] = [];

  constructor(private readonly dataset: string) {
  }

  /*
   * This method is here to encapsulate the translation of filter settings
   * between the API layer of the SDK (IFilteringCriterion) and the internal
   * logic for compiling filters into JSON (ICondition).
   */
  public setFilterCriteria(filter: IFilteringCriterion) {
    this.filteringConditions = (filter as any).lowLevelCondition;
  }

  public addSortCondition<K extends Extract<keyof T, string>>(direction: Direction, ...fields: K[]) {
    if (fields.length === 0) {
      throw new Error(MESSAGE.QUERY.MUST_PROVIDE_SORTING_FIELD);
    }
    this.orders.push({ fields, direction });
  }

  public addRelation(relation: Query): void {
    this.relations.push(relation);
  }

  /* Collect all conditionals inside one object
   * to pass it to the API. Some conditionals can be skipped
   */
  public compile(): Partial<ICompiledQuery<T>> {
    let compiledQueryOptions: Partial<ICompiledQuery<T>> = {};

    /* Compile conditions
     */
    if (this.filteringConditions) {
      compiledQueryOptions.conditions = [this.filteringConditions.compile()];
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
    if (this.fields) {
      compiledQueryOptions.outputs = this.fields.map(
        (field) => typeof field === "object" ? this.compileAggregation(field) : field
      );
    }

    /* Compile sort options
     */
    if (this.orders.length) {
      compiledQueryOptions.order = this.orders;
    }

    /* Compile relations
     */
    if (this.relations.length) {
      compiledQueryOptions.relations = this.relations.reduce((relations, relation) => (
        { ...relations, [relation.dataset]: relation.compile() }
      ), {});
    }

    return compiledQueryOptions;
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
