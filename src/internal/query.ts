import { IFilteringCriterion } from "../api/dataops/filteringApi";
import { ICondition } from "../api/dataops/filteringCondition";
import { MESSAGE } from "../config/message";

/* Sort direction
 */
export type Direction = "asc" | "desc";

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
type SortedFields<T> = Array<ISort<Extract<keyof T, string>>>;

export interface ICompiledQuery<T> {
  data: T;
  conditions: Array<object>;
  fields: string[];
  orders: SortedFields<T>;
  range: { limit?: number, offset?: number };
  relations: {[key: string]: Partial<ICompiledQuery<T>>};
}

export class Query<T = any> {
  public fields: string[];
  public limit: number;
  public offset: number;
  public data: T;

  private relations: Query[] = [];
  private filteringConditions: ICondition;
  private orders: SortedFields<T> = [];

  constructor(public readonly dataset: string) {
  }

  /*
   * This method is here to encapsulate the translation of filter settings
   * between the API layer of the SDK (IFilteringCriterion) and the internal
   * logic for compiling filters into JSON (ICondition).
   */
  public setFilterCriteria(filter: IFilteringCriterion) {
    this.filteringConditions = (filter as any).lowLevelCondition;
  }

  public addSortCondition<K extends Extract<keyof T, string>>(direction: "asc" | "desc", ...fields: K[]) {
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
      compiledQueryOptions.fields = this.fields;
    }

    /* Compile sort options
     */
    if (this.orders.length) {
      compiledQueryOptions.orders = this.orders;
    }

    /* Compile data
     */
    if (this.data) {
      compiledQueryOptions.data = this.data;
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
}
