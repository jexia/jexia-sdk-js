import { QueryAction } from "../api/dataops/queries/baseQuery";

export type QueryParam = { key: string; value: any; };

export interface IRequestExecuterData {
  action: QueryAction;
  body?: any;
  queryParams?: QueryParam[];
}
