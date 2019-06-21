import { QueryAction } from "../api/core/queries/baseQuery";
import { ResourceType } from "../api/core/resource";

export type QueryParam = { key: string; value: any; };

export interface IRequestExecuterData {
  resourceType: ResourceType;
  resourceName: string;
  action: QueryAction;
  body?: any;
  queryParams?: QueryParam[];
}

/**
 * Maps an object into a list of QueryParam
 * @param   o The object to be mapped
 * @returns QueryParam A list of query params
 */
export function toQueryParams(o: object): QueryParam[] {
  return Object.entries(o).map(([key, value]) => ({ key, value }));
}
