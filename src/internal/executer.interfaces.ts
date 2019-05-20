import { QueryAction } from "../api/dataops/queries/baseQuery";

// type QueryParam = Partial<ICompiledQuery<T>>;

export interface IRequestExecuterData {
  action: QueryAction;
  body?: any;
  // queryParams?: QueryParam[];
}
