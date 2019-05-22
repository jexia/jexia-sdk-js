import { RequestExecuter } from "../../../internal/executer";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for delete statements.
 * For TypeScript users it implements a generic type `T` that represents your dataset (defaults to `any`).
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *  .delete()
 *  .where(field => field("title").isLike("test"))
 *  .execute();
 * ```
 *
 * @template T Generic type of your dataset inhereted from dataset class
 */
export class DeleteQuery<T> extends FilterableQuery<T> {

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    super(queryExecuter, QueryAction.delete, dataset);
  }
}
