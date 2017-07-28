import { DataRequest } from "../dataRequest";
import { ICondition } from "../filteringCondition";
import { QuerySet } from "../querySet";

export interface ICompiledRequest {
    action: string;
    records?: Array<object>;
    params?: ICompiledQuery;
}

export interface ICompiledQuery {
  data?: object;
  conditions?: Array<object>;
  fields?: string[];
  orders?: Array<object>;
  range?: object;
}

export function compileDataRequest(dataRequest: DataRequest): ICompiledRequest {
  if (!dataRequest.Action) {
    throw new Error("You need to set an Action before compiling the Request.");
  }

  let compiledQuery: ICompiledRequest = {action: dataRequest.Action};
  let compiledQueryOptions = new QueryBasedCompiler(dataRequest.Query).compile();

  if (compiledQueryOptions && Object.keys(compiledQueryOptions).length !== 0 ) {
    compiledQuery.params = compiledQueryOptions;
  }

  if (dataRequest.Records) {
    compiledQuery.records = dataRequest.Records;
  }

  return compiledQuery;
}

export class QueryBasedCompiler {
    private queryObject: QuerySet;

    public constructor(queryObject: QuerySet) {
        this.queryObject = queryObject;
    }

    public compile(): ICompiledQuery {
        return this.compileQueryOptions(this.queryObject);
    }

    private compileLimitOffset(queryOptions: any, query: QuerySet): object {
        let range: any = {};
        if (query.Limit) {
            range.limit = query.Limit;
        }
        if (query.Offset) {
            range.offset = query.Offset;
        }
        return range;
    }

    private compileFilteringConditions(condition: ICondition): object {
      return [condition.compile()];
    }

    private compileQueryOptions(query: QuerySet): ICompiledQuery {
      let compiledQueryOptions: any = {};
      if (query.Filter) {
        compiledQueryOptions.conditions = this.compileFilteringConditions(query.Filter);
      }

      let range = this.compileLimitOffset(compiledQueryOptions, this.queryObject);
      if (Object.keys(range).length > 0) {
        compiledQueryOptions.range = range;
      }

      if (query.Fields) {
        compiledQueryOptions.fields = query.Fields;
      }

      if (query.SortOrders && query.SortOrders.length > 0) {
        compiledQueryOptions.orders = query.SortOrders;
      }

      if (query.Data) {
        compiledQueryOptions.data = query.Data;
      }

      if (query.Relations && query.Relations.length > 0) {
        compiledQueryOptions.relations = {};
        for (let relation of query.Relations) {
          compiledQueryOptions.relations[relation.Dataset] = new QueryBasedCompiler(relation).compile();
        }
      }

      return compiledQueryOptions;
    }
}
