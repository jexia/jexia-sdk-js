import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { QueryParam } from "./../../../internal/executer.interfaces";
import { attachRelation } from "./../../../internal/utils";
import { IFilteringCriterion, IFilteringCriterionCallback, toFilteringCriterion } from "./../../dataops/filteringApi";
import { QueryAction } from "./baseQuery";
import { FilterableQuery } from "./filterableQuery";

/**
 * Query object specialized for attach statements.
 * This object is generated automatically from the Dataset object, never to be instantiated directly.
 *
 * ### Example
 * ```typescript
 * dataModule.dataset("posts")
 *  .attach("comments", field => field("post.id").isEqualTo(somePostId))
 *  .execute();
 * ```
 *
 * @template T Generic type of your resource, default to any
 */
export class AttachQuery<T> extends FilterableQuery<T> {

  /**
   * @internal
   */
  public constructor(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    private readonly attachedResourceName: string,
    private readonly filter: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ) {
    super(queryExecuter, QueryAction.update, resourceType, resourceName);
  }

  /**
   * @inheritdoc
   */
  protected compileToQueryParams(): QueryParam[] {
    return attachRelation(
      super.compileToQueryParams(),
      this.attachedResourceName,
      toFilteringCriterion(this.filter).condition.compile(),
    );
  }
}
