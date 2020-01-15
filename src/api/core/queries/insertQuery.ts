import { RequestExecuter } from "../../../internal/executer";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { ResourceType } from "../resource";
import { BaseQuery } from "./baseQuery";

/**
 * Query object specialized for insert statements.
 * For TypeScript users it implements a generic type `T` that represents your dataset (defaults to `any`).
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *  .insert({
 *    title: "My Title"
 *  })
 *  .execute();
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class InsertQuery<T> extends BaseQuery<T> {
  /**
   * @internal
   */
  public constructor(
    queryExecuter: RequestExecuter,
    protected readonly body: Array<Partial<T>>,
    resourceType: ResourceType,
    resourceName: string) {
    super(queryExecuter, RequestMethod.POST, resourceType, resourceName);
  }
}
