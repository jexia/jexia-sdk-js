import { ICondition } from "../filteringCondition";
import { QuerySet } from "../querySet";

interface ICompiledQueryObject {
    action: string;
    records?: Array<object>;
    params?: object;
}

export class QueryBasedCompiler {
    private queryObject: QuerySet;

    public constructor(queryObject: QuerySet) {
        this.queryObject = queryObject;
    }

    public compile(): ICompiledQueryObject {
        return this.compileQueryObject();
    }

    private compileLimitOffset(queryOptions: any, query: QuerySet): object {
    /*  This method creates the range object containing offset and limit
        fields required by backend service.
    */
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

    private compileQueryOptions(query: QuerySet): object {
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

      if (query.SortOrders) {
        compiledQueryOptions.orders = query.SortOrders;
      }

      return compiledQueryOptions;
    }

    private compileQueryObject(): ICompiledQueryObject {
        if (!this.queryObject.Action) {
          throw new Error("You need to set an Action before compiling the Query.");
        }

        let compiledQuery: ICompiledQueryObject = {action: this.queryObject.Action};

        let compiledQueryOptions = this.compileQueryOptions(this.queryObject);

        if (compiledQueryOptions && Object.keys(compiledQueryOptions).length !== 0 ) {
          compiledQuery.params = compiledQueryOptions;
        }

        if (this.queryObject.Records) {
          compiledQuery.records = this.queryObject.Records;
        }

        return compiledQuery;
    }

}
