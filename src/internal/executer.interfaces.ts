import { ResourceType } from "../api/core/resource";
import { RequestMethod } from "./requestAdapter.interfaces";
import { QueryParam } from "./utils";

export interface IRequestExecuterData {
  resourceType: ResourceType;
  resourceName: string;
  method: RequestMethod;
  body?: any;
  queryParams?: QueryParam[];
}
