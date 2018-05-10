import { RequestExecuter } from "../../internal/executer";
import { DataRequest } from "./dataRequest";
import { IExecutable} from "./queryInterfaces";

/**
 * Query object specialized for insert statements.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object is generated automatically from the Dataset object, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * const posts = dataModule.dataset("posts");
 * posts.insert({
 *    title: 'My Title'
 *  })
 *  .execute()
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
export class InsertQuery<T = any> implements IExecutable {
  private request: DataRequest<T>;
  private queryExecuter: RequestExecuter;

  /**
   * @internal
   */
  public constructor(queryExecuter: RequestExecuter, records: T[], dataset: string) {
    this.request = new DataRequest("insert", dataset);
    this.queryExecuter = queryExecuter;
    this.request.Records = records;
  }

  /**
   * Execute this query
   * @returns Result of this operation with the affected data
   */
  public execute(): Promise<T[]> {
    return this.request.execute(this.queryExecuter);
  }
}
