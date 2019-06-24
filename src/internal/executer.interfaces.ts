import { QueryAction } from "../api/core/queries/baseQuery";
import { ResourceType } from "../api/core/resource";
import { QueryParam } from "./utils";

export interface IRequestExecuterData {
  resourceType: ResourceType;
  resourceName: string;
  action: QueryAction;
  body?: any;
  queryParams?: QueryParam[];
}
