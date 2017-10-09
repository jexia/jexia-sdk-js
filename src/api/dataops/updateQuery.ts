import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { IFilteringCriterion } from "./filteringApi";
import { IExecutable, IFilterable, ILimit, IOffset, ISortable } from "./queryInterfaces";

export class UpdateQuery implements ILimit, IOffset, IFilterable, IExecutable, ISortable {
  private request: DataRequest;
  private queryExecuter: RequestExecuter;

  public constructor(queryExecuter: RequestExecuter, data: object, dataset: string) {
    this.request = new DataRequest("update", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Query.Data = data;
  }
  public limit(limit: number): UpdateQuery {
    this.request.Query.Limit = limit;
    return this;
  }
  public offset(offset: number): UpdateQuery {
    this.request.Query.Offset = offset;
    return this;
  }
  public filter(filter: IFilteringCriterion): UpdateQuery {
    this.request.Query.setFilterCriteria(filter);
    return this;
  }
  public sortAsc(...fields: string[]): UpdateQuery {
    this.request.Query.AddSortCondition("asc", ...fields);
    return this;
  }
  public sortDesc(...fields: string[]): UpdateQuery {
    this.request.Query.AddSortCondition("desc", ...fields);
    return this;
  }

  public execute() {
    return this.request.execute(this.queryExecuter);
  }
}
