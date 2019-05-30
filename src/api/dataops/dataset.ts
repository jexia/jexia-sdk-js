import { Inject, Injectable } from "injection-js";
import { RequestExecuter } from "../../internal/executer";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { InsertQuery } from "../core/queries/insertQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { IResource, ResourceType } from "../core/resource";
import { DataSetName } from "./dataops.tokens";

/**
 * Default fields that will always exist for any dataset
 */
export type DefaultDatasetFields = "id" | "created_at" | "updated_at";

/**
 * Default dataset interface type
 */
export type DefaultDatasetInterface = {
  [P in DefaultDatasetFields]: string;
};

/**
 * Extend user provided interface (T) with default dataset fields
 */
export type DatasetInterface<T> = T & DefaultDatasetInterface;

/**
 * Dataset object used to fetch and modify data at your datasets.
 * For TypeScript users it implements a generic type T that represents your dataset, default to any.
 * This object must be build from the data operations module, never to be instantiated direct.
 *
 * @example
 * ```typescript
 * import { jexiaClient, dataOperations } from "jexia-sdk-js/node";
 *
 * const dataModule = dataOperations();
 *
 * jexiaClient().init({projectID: "your Jexia App URL", key: "username", secret: "password"}, dataModule);
 *
 * dataModule.dataset("posts")
 *   .select()
 *   .execute()
 *   .then( (data) => {
 *     // you have been succesfully logged in!
 *     // you can start using the dataModule variable to operate on records here
 *   }).catch( (error) => {
 *     // uh-oh, there was a problem logging in, check the error.message for more info
 *   });
 * ```
 *
 * @template T Generic type of your dataset, default to any
 */
@Injectable()
export class Dataset<T extends object = any, D extends DatasetInterface<T> = DatasetInterface<T>> implements IResource {
  /**
   * Resource type of the dataset
   */
  public readonly resourceType: ResourceType = ResourceType.Dataset;

  /**
   * @internal
   */
  public constructor(
    @Inject(DataSetName) private datasetName: string,
    private requestExecuter: RequestExecuter
  ) {}

  /**
   * Name of the working dataset.
   */
  public get name(): string {
    return this.datasetName;
  }

  /**
   * Creates a Select query.
   * @returns Query object specialized for select statements.
   * With no filters set, returns all records in the selected dataset.
   */
  public select(): SelectQuery<D> {
    return new SelectQuery<D>(this.requestExecuter, ResourceType.Dataset, this.datasetName);
  }

  /**
   * Creates an Update query.
   * @param data Dictionary that contains the key:value pairs for the fields that you want to modify of this dataset
   * @returns Query object specialized for update statements.
   * Don't forget to apply a filter to specify the fields that will be modified.
   */
  public update(data: T): UpdateQuery<T> {
    return new UpdateQuery<T>(this.requestExecuter, data, ResourceType.Dataset, this.datasetName);
  }

  /**
   * Creates an Insert query.
   * @param data A dictionary that contains the key:value pairs for
   * the fields you want to store at this dataset or an array of those.
   * @returns Query object specialized for insert statements
   * If saving into a strict schema dataset, you need to provide values for the
   * required fields for that particular dataset.
   */
  public insert(data: T[] | T): InsertQuery<T, D> {
    return new InsertQuery<T, D>(
      this.requestExecuter,
      Array.isArray(data) ? data : [data],
      ResourceType.Dataset,
      this.datasetName,
    );
  }

  /**
   * Creates a Delete query
   * @returns Query object specialized for delete statements
   * You need to specify a filter to narrow down the records that you want deleted
   * from the backend.
   */
  public delete(): DeleteQuery<D> {
    return new DeleteQuery<D>(this.requestExecuter, ResourceType.Dataset, this.datasetName);
  }

}

(Dataset as any).prototype.watch = () => {
  throw new Error("Import and initialize real time module to use this method!");
};
