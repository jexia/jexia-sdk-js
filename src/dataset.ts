import { DeleteQuery} from "./deleteQuery";
import { RequestExecuter } from "./executer";
import { InsertQuery} from "./insertQuery";
import { QueryExecuterBuilder } from "./queryExecuterBuilder";
import { SelectQuery} from "./selectQuery";
import { UpdateQuery} from "./updateQuery";

export class Dataset {
    private dataSchema: string;
    private dataset: string;
    private queryExecuterBuilder: RequestExecuter;
    public constructor(schema: string, dataset: string, queryExecuterBuilder: QueryExecuterBuilder) {
        this.dataSchema = schema;
        this.dataset = dataset;
        this.queryExecuterBuilder = queryExecuterBuilder.createQueryExecuter(this.dataSchema, this.dataset);
    }

    public get name(): string {
      return this.dataset;
    }

    public get schema(): string {
      return this.dataSchema;
    }

    public select() {
        return new SelectQuery(this.queryExecuterBuilder, this.dataset);
    }
    public update(data: object) {
        return new UpdateQuery(this.queryExecuterBuilder, data, this.dataset);
    }
    public insert(records: Array<object>) {
        return new InsertQuery(this.queryExecuterBuilder, records, this.dataset);
    }
    public delete() {
        return new DeleteQuery(this.queryExecuterBuilder, this.dataset);
    }
}
