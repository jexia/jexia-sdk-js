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
