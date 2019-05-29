import { RequestExecuter } from "../../../internal/executer";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for update statements.
 * For TypeScript users it implements a generic type `T` that represents your dataset (defaults to `any`).
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *  .update({
 *    title: "My Updated Title"
 *  })
 *  .where(field => field("title").isLike("old title"))
 *  .execute();
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class UpdateQuery<T> extends FilterableQuery<T> {
  /**
   * @inheritdoc
   */
  protected readonly body: T | null;

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, data: T, dataset: string) {
    super(queryExecuter, QueryAction.update, dataset);
    this.body = data;
  }

}
