import { Query } from "../query";
interface IfinalQueryObject {
    [key: string]: any;
}
const excludeCopying = ["limit", "offset"];
export class QueryCompiler {
    private finalQueryObject: IfinalQueryObject;
    private queryObject: any;
    private queryType: string;
    public constructor(queryObject: Query, queryType: string) {
        this.queryObject = queryObject;
        this.finalQueryObject = {};
        this.queryType = queryType;
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
        this.finalQueryObject.action = this.queryType;
        this.finalQueryObject.params = tempQueryObj;
    }
}
