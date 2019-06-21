import { RequestExecuter } from "../../../internal/executer";
import { ResourceType } from "../resource";
import { addActionParams, QueryActionType, QueryParam } from "./../../../internal/utils";
import { IFilteringCriterion, IFilteringCriterionCallback, toFilteringCriterion } from "./../../dataops/filteringApi";
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
  public constructor(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    private readonly attachedResourceName: string,
    private readonly relationType: QueryActionType,
    private readonly filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ) {
    super(queryExecuter, QueryAction.update, resourceType, resourceName);
  }

  /**
   * @inheritdoc
   */
  protected compileToQueryParams(): QueryParam[] {
    return addActionParams(
      super.compileToQueryParams(),
      this.attachedResourceName,
      this.relationType,
      this.compiledCondition,
    );
  }

  private get compiledCondition(): any {
    return this.filter ? toFilteringCriterion(this.filter).condition.compile() : null;
  }
}
