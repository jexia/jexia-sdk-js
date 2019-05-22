import { QueryAction } from "../api/dataops/queries/baseQuery";
import { ICompiledQuery } from './query';

export type QueryParams = Partial<ICompiledQuery<any>>;

export interface IRequestExecuterData {
  action: QueryAction;
  body?: any;
  queryParams?: QueryParams;
}
