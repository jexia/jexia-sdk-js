import { RecordSet } from "../recordSet";
interface IfinalQueryObject {
    [key: string]: any;
}
export class RecordBasedCompiler {
    private finalQueryObject: IfinalQueryObject;
    private queryObject: any;

    public constructor(queryObject: RecordSet) {
        this.queryObject = queryObject;
        this.finalQueryObject = {};
    };
    public compile() {
        this.makefinalQueryObject();
        return this.finalQueryObject;
    }

    private makefinalQueryObject() {
        for ( let k in this.queryObject) {
            if (this.queryObject.hasOwnProperty(k)) {
                this.finalQueryObject[k] = this.queryObject[k];
            }
        }
    }

}
