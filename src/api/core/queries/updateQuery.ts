import { RequestExecuter } from "../../../internal/executer";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { ResourceType } from "../resource";
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
  public constructor(queryExecuter: RequestExecuter, data: T, resourceType: ResourceType, resourceName: string) {
    super(queryExecuter, RequestMethod.PATCH, resourceType, resourceName);
    this.body = data;
  }

}
