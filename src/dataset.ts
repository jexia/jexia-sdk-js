import { DeleteQuery} from "./deleteQuery";
import { InsertQuery} from "./insertQuery";
import { QueryExecuter } from "./queryExecuter";
import { QueryExecuterFactory } from "./queryExecuterFactory";
import { SelectQuery} from "./selectQuery";
import { UpdateQuery} from "./updateQuery";

export class Dataset {
    private schema: string;
    private dataset: string;
    private queryExecuter: QueryExecuter;
    public constructor(schema: string, dataset: string, queryExecutorFactory: QueryExecuterFactory) {
        this.schema = schema;
        this.dataset = dataset;
        this.queryExecuter = queryExecutorFactory.createQueryExecuter(this.schema, this.dataset);
    }
    public select() {
        return new SelectQuery(this.queryExecuter, this.dataset);
    }
    public update(data: object) {
        return new UpdateQuery(this.queryExecuter, data, this.dataset);
    }
    public insert(records: Array<object>) {
        return new InsertQuery(this.queryExecuter, records, this.dataset);
    }
    public delete() {
        return new DeleteQuery(this.queryExecuter, this.dataset);
    }
}
