import { RequestExecuter } from "../../../internal/executer";
import { BaseQuery, QueryAction } from "./baseQuery";

/**
 * Query object specialized for insert statements.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object is generated automatically from the Dataset object, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * const posts = dataModule.dataset("posts");
 * posts.insert({
 *    title: 'My Title'
 *  })
 *  .execute()
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class InsertQuery<T> extends BaseQuery<T> {

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, records: T[], dataset: string) {
    super(queryExecuter, QueryAction.insert, dataset);
    this.records = records;
  }
}
