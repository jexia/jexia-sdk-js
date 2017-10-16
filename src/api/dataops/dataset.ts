import { RequestExecuter } from "../../internal/executer";
import { QueryExecuterBuilder } from "../../internal/queryExecuterBuilder";
import { DeleteQuery} from "./deleteQuery";
import { InsertQuery} from "./insertQuery";
import { SelectQuery} from "./selectQuery";
import { UpdateQuery} from "./updateQuery";

export class Dataset {
    private dataset: string;
    private queryExecuterBuilder: RequestExecuter;
    public constructor(dataset: string, queryExecuterBuilder: QueryExecuterBuilder) {
        this.dataset = dataset;
        this.queryExecuterBuilder = queryExecuterBuilder.createQueryExecuter(this.dataset);
    }

    public get name(): string {
      return this.dataset;
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
