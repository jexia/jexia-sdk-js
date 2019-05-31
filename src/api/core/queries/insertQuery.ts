import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { BaseQuery, QueryAction } from "./baseQuery";

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
 * @template D Extended dataset type with default fields (i.e id, created_at, updated_at)
 */
export class InsertQuery<T, D extends T> extends BaseQuery<T> {
  /**
   * @inheritdoc
   */
  protected readonly body: T[];

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, records: T[], resourceType: ResourceType, resourceName: string) {
    super(queryExecuter, QueryAction.insert, resourceType, resourceName);
    this.body = records;
  }

  /**
   * Overload parent execute request to call rest API
   * @returns {Promise<D[]>}
   */
  public execute(): Promise<D[]> {
    return this.queryExecuter.executeRequest({
      resourceType: this.resourceType,
      resourceName: this.resourceName,
      action: this.action,
      body: this.body,
    });
  }
}
