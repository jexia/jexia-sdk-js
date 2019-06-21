import { QueryParam } from "./queryParam";

export enum QueryActionType {
  ATTACH = "attach",
  DETACH = "detach",
}

/**
 * Adds action params to a query params array.
 *
 * @param   queryParams The query params to be appended
 * @param   resourceName The name of the resource action will be applied
 * @param   queryActionType The type of the action
 * @param   [condition] The condition to fullfil the action requirements
 * @returns QueryParam[]
 */
export function addActionParams(
  queryParams: QueryParam[],
  resourceName: string,
  queryActionType: QueryActionType,
  condition?: any,
): QueryParam[] {
  const params = [
    { key: "action", value: queryActionType, },
    { key: "action_resource", value: resourceName, },
  ];

  if (condition) {
    params.push({ key: "action_cond", value: condition });
  }

  return queryParams.concat(params);
}
