import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { ICondition } from "./filteringCondition";
import { IExecutable, IFields, IFilterable, ILimit, IOffset, ISortable } from "./queryInterfaces";

export class DeleteQuery implements IFields, ILimit, IOffset, IFilterable, IExecutable, ISortable {
  private request: DataRequest;
  private queryExecuter: RequestExecuter;
  public constructor(queryExecuter: RequestExecuter, dataset: string) {
    this.request = new DataRequest("delete", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Action = "delete";
  }
  public fields(...fields: string[]): DeleteQuery {
    this.request.Query.Fields = fields;
    return this;
  }
  public limit(limit: number): DeleteQuery {
    this.request.Query.Limit = limit;
    return this;
  }
  public offset(offset: number): DeleteQuery {
    this.request.Query.Offset = offset;
    return this;
  }
  public filter(filter: ICondition): DeleteQuery {
    this.request.Query.Filter = filter;
    return this;
  }
  public sortAsc(...fields: string[]): DeleteQuery {
    this.request.Query.AddSortCondition("asc", ...fields);
    return this;
  }
  public sortDesc(...fields: string[]): DeleteQuery {
    this.request.Query.AddSortCondition("desc", ...fields);
    return this;
  }
  public execute() {
    return this.request.execute(this.queryExecuter);
  }
}
