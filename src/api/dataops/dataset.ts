import { RequestExecuter } from "../../internal/executer";
import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { IResource } from "../core/resource";
import { DeleteQuery} from "./deleteQuery";
import { InsertQuery} from "./insertQuery";
import { SelectQuery} from "./selectQuery";
import { UpdateQuery} from "./updateQuery";

export class Dataset implements IResource {
    private datasetName: string;
    private queryExecuterBuilder: RequestExecuter;
    public constructor(dataset: string, queryExecuterBuilder: QueryExecuterBuilder) {
        this.datasetName = dataset;
        this.queryExecuterBuilder = queryExecuterBuilder.createQueryExecuter(this.datasetName);
    }

    public get name(): string {
      return this.datasetName;
    }

    public select() {
        return new SelectQuery(this.queryExecuterBuilder, this.datasetName);
    }
    public update(data: object) {
        return new UpdateQuery(this.queryExecuterBuilder, data, this.datasetName);
    }
    public insert(records: Array<object>) {
        return new InsertQuery(this.queryExecuterBuilder, records, this.datasetName);
    }
    public delete() {
        return new DeleteQuery(this.queryExecuterBuilder, this.datasetName);
    }
}
