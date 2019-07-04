import { RequestExecuter } from "../../../internal/executer";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { ResourceType } from "../resource";
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
  public constructor(queryExecuter: RequestExecuter, resourceType: ResourceType, resourceName: string) {
    super(queryExecuter, RequestMethod.DELETE, resourceType, resourceName);
  }
}
