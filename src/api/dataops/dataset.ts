import { RequestExecuter } from "../../internal/executer";
import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { IResource } from "../core/resource";
import { DeleteQuery} from "./deleteQuery";
import { InsertQuery} from "./insertQuery";
import { SelectQuery} from "./selectQuery";
import { UpdateQuery } from "./updateQuery";

export type DefaultDatasetFields = "id" | "created_at" | "updated_at";

export class Dataset<T = any> implements IResource {
    private datasetName: string;
    private queryExecuterBuilder: RequestExecuter;
    public constructor(dataset: string, queryExecuterBuilder: QueryExecuterBuilder) {
        this.datasetName = dataset;
        this.queryExecuterBuilder = queryExecuterBuilder.createQueryExecuter(this.datasetName);
    }

    public get name(): string {
      return this.datasetName;
    }

    /**
     * Creates a Select query.
     * With no filters set, returns all records in the selected dataset.
     */
    public select(): SelectQuery<T> {
        return new SelectQuery(this.queryExecuterBuilder, this.datasetName);
    }

    /**
     * Creates an Update query.
     * Data is a dictionary that contains the key:value pairs
     * for the fields that you want to modify. Don't forget to apply
     * a filter to specify the fields that will be modified.
     */
    public update(data: T): UpdateQuery<T> {
        return new UpdateQuery(this.queryExecuterBuilder, data, this.datasetName);
    }

    /**
     * Creates an Insert query.
     * Records is an array of objects that you want to store in the backend.
     * If saving into a strict schema dataset, you need to provide values for the
     * required fields for that particular dataset.
     */
    public insert(records: T[]): InsertQuery<T> {
        return new InsertQuery(this.queryExecuterBuilder, records, this.datasetName);
    }

    /**
     * Creates a Delete query.
     * You need to specify a filter to narrow down the records that you want deleted
     * from the backend.
     */
    public delete(): DeleteQuery<T> {
        return new DeleteQuery(this.queryExecuterBuilder, this.datasetName);
    }
}
