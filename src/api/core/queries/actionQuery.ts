import { RequestExecuter } from "../../../internal/executer";
import { QueryActionType } from "../../../internal/utils";
import { IFilteringCriterion, IFilteringCriterionCallback } from "../../dataops/filteringApi";
import { ResourceType } from "../resource";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for generic action statements.
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * // Attaching resources to a dataset
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
  constructor(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    actionResourceName: string,
    queryActionType: QueryActionType,
    filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ) {
    super(queryExecuter, QueryAction.update, resourceType, resourceName);
    this.query.setAction(queryActionType, actionResourceName, filter);
  }
}
