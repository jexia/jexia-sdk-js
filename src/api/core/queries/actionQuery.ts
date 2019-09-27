import { RequestExecuter } from "../../../internal/executer";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { QueryActionType } from "../../../internal/utils";
import { field, IFilteringCriterion, IFilteringCriterionCallback } from "../filteringApi";
import { IdentityCollection, ResourceInterface, ResourceType } from "../resource";
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
export class ActionQuery<T, D extends ResourceInterface<T>> extends FilterableQuery<D> {

  /**
   * @internal
   */
  constructor(
    queryExecuter: RequestExecuter,
    resourceType: ResourceType,
    resourceName: string,
    actionResourceName: string,
    public readonly queryActionType: QueryActionType,
    filter: IFilteringCriterion<D> | IFilteringCriterionCallback<D> | IdentityCollection<D>,
  ) {
    super(queryExecuter, RequestMethod.PUT, resourceType, resourceName);
    this.query.setAction(queryActionType, actionResourceName, this.getFilter(filter));
  }

  private getFilter(
    filter: IFilteringCriterion<D> | IFilteringCriterionCallback<D> | IdentityCollection<D>,
  ): IFilteringCriterion<D> | IFilteringCriterionCallback<D> {
    if (!Array.isArray(filter)) {
      return filter;
    }

    const idCollection: any[] = filter;
    const hasInvalidIds = () => idCollection.some((o) => !o || typeof o === "object" && !o.id);
    const hasMixedData = () => new Set<any>(idCollection.map((o) => typeof o)).size > 1;

    if (hasInvalidIds() || hasMixedData()) {
      throw Error("Invalid resource or id list: " + idCollection);
    }

    const hasOnlyIds = idCollection.every((o) => typeof o === "string");
    const ids = hasOnlyIds ? idCollection : idCollection.map((c) => c.id);

    return field("id").isInArray(ids);
  }
}
