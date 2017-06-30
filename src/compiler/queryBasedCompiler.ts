import { QuerySet } from "../querySet";
interface IfinalQueryObject {
    [key: string]: any;
}
/* These are parameters from query object which will not be copied to
 params of finaly query object directly*/
const excludeCopying = ["limit", "offset", "action"];
export class QueryBasedCompiler {
    private finalQueryObject: IfinalQueryObject;
    private queryObject: any;

    public constructor(queryObject: QuerySet) {
        this.queryObject = queryObject;
        this.finalQueryObject = {};
    };
    public compile() {
        this.makefinalQueryObject();
        return this.finalQueryObject;
    }
    private limitOffsetToRange(queryObj: any) {
    /*  This method creates the range object containing offset and limit
        fields required by backend service.
    */
        let range: any = {};
        if (this.queryObject.Limit) {
            range.limit = this.queryObject.Limit;
        }
        if (this.queryObject.Offset) {
            range.offset = this.queryObject.Offset;
        }
        if (Object.keys(range).length > 0) {
           queryObj.range = range;
        }
    };

    private makefinalQueryObject() {
        let tempQueryObj: any = {};
        this.limitOffsetToRange(tempQueryObj);
        for ( let k in this.queryObject) {
            if (excludeCopying.indexOf(k) < 0 && this.queryObject.hasOwnProperty(k)) {
                tempQueryObj[k] = this.queryObject[k];
            }
        }
        this.finalQueryObject.params = tempQueryObj;
        this.finalQueryObject.action = this.queryObject.action;
    }

}
