import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { QueryActionType } from "./../../../internal/utils";
import { IFilteringCriterion, IFilteringCriterionCallback } from "./../../dataops/filteringApi";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for generic action statements.
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * // Attaching resources
 * dataModule.dataset("posts")
 *  .attach("comments", field => field("post.id").isEqualTo(somePostId))
 *  .execute();
 * ```
 *
 * @template T Generic type of your resource, default to any
 */
export class ActionQuery<T> extends FilterableQuery<T> {

  /**
   * @internal
   */
  public static create<T>(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    actionResourceName: string,
    queryActionType: QueryActionType,
    filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ): ActionQuery<T> {
    return new ActionQuery(
      queryExecuter,
      resourceType,
      resourceName,
      actionResourceName,
      queryActionType,
      filter,
    ).setQueryAction();
  }

  /**
   * @internal
   */
  private constructor(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    private readonly actionResourceName: string,
    private readonly queryActionType: QueryActionType,
    private readonly filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ) {
    super(queryExecuter, QueryAction.update, resourceType, resourceName);
  }

  private setQueryAction(): this {
    this.query.setAction(this.queryActionType, this.actionResourceName, this.filter);
    return this;
  }
}
