import { QueryParam } from "../executer.interfaces";

export enum RelationLinkType {
  ATTACH = "attach",
}

/**
 * Adds attach operation params to a query params array.
 *
 * @param  queryParams The query params to be appended
 * @param  resourceName The name of the resource
 * @param  relationLinkType The type of t
 * @returns QueryParam[]
 */
export function linkRelation(
  queryParams: QueryParam[],
  resourceName: string,
  relationLinkType: RelationLinkType,
  condition: any,
): QueryParam[] {
  return queryParams.concat([
    { key: "action", value: relationLinkType, },
    { key: "action_resource", value: resourceName, },
    { key: "action_cond", value: condition },
  ]);
}

/**
 * Adds attach operation params to a query params array.
 *
 * @param  queryParams The query params to be appended
 * @param  resourceName The name of the resource
 * @returns QueryParam[]
 */
export function attachRelation(
  queryParams: QueryParam[],
  resourceName: string,
  condition: any,
): QueryParam[] {
  return linkRelation(queryParams, resourceName, RelationLinkType.ATTACH, condition);
}
