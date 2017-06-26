import { QueryExecuter } from "./queryExecuter";
import { QueryExecuterFactory } from "./queryExecuterFactory";
import { SelectQuery } from "./selectQuery";

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
        return new SelectQuery(this.queryExecuter);
    }
}
