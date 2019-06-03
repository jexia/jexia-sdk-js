import { Subscription } from "rxjs";
import { RTCMessageSchema } from "../lib/rtc";
import { cleaning, dom, init } from "../teardowns";

// tslint:disable-next-line:no-var-requires
const joiAssert = require("joi-assert");

jest.setTimeout(15000); // for the unstable internet connection

describe("Real Time Communication", () => {

  // Unique name because tests could be run in parallel
  const datasetName = "rtc_dataset";

  beforeAll(async () => init(datasetName));

  afterAll(async () => cleaning());

  let RTCMessage: any;
  let subscription: Subscription;

  let recordId: string;

  describe("create one record message", () => {

    afterAll(() => {
      subscription.unsubscribe();
      RTCMessage = undefined;
    });

    it("should be received when new record inserted", (done) => {
      subscription = dom.dataset(datasetName)
        .watch("created")
        .subscribe((message) => {
          RTCMessage = message;
          expect(RTCMessage).toBeDefined();
          done();
        });

      dom.dataset(datasetName)
        .insert([{test_field: "name"}])
        .execute();
    });

    it("should have correct schema", () => {
      joiAssert(RTCMessage, RTCMessageSchema);
    });

    it("should contain the same record as being inserted", () => {
      expect(RTCMessage.data[0].test_field).toEqual("name");
    });
  });

  describe("create an array of records message", () => {

    afterAll(() => {
      subscription.unsubscribe();
      RTCMessage = undefined;
    });

    it("should be received when array has been inserted", (done) => {
      subscription = dom.dataset(datasetName)
        .watch("created")
        .subscribe((message) => {
          RTCMessage = message;
          expect(RTCMessage).toBeDefined();
          done();
        });

      dom.dataset(datasetName)
        .insert([
          { test_field: "name1" },
          { test_field: "name2" },
          { test_field: "name3" }
        ])
        .execute();
    });

    it("should have correct schema", () => {
      joiAssert(RTCMessage, RTCMessageSchema);
    });

    it("should contain the same records as being inserted", () => {
      expect(RTCMessage.data.map((data: any) => data.test_field)).toEqual(["name1", "name2", "name3"]);
    });

  });

  // TODO Update method doesn't work at the moment
  xdescribe("update one record message", () => {

    // Insert a record for the updating
    beforeAll(async () => {
      const records = await dom.dataset(datasetName)
        .insert([{test_field: "name"}])
        .execute();
      recordId = records[0].id;
    });

    afterAll(() => {
      subscription.unsubscribe();
      RTCMessage = undefined;
    });

    it("should be received when one record updated", (done) => {
      subscription = dom.dataset(datasetName)
        .watch("updated")
        .subscribe((message) => {
          RTCMessage = message;
          expect(RTCMessage).toBeDefined();
          done();
        });

      dom.dataset(datasetName)
        .update({test_field: "name_new"})
        .where((field) => field("id").isEqualTo(recordId))
        .execute();
    });

  });

  // TODO Delete method doesn't work at the moment
  xdescribe("delete one record message", () => {

    // Insert a record for deletion
    beforeAll(async () => {
      const records = await dom.dataset(datasetName)
        .insert([{test_field: "name"}])
        .execute();
      recordId = records[0].id;
    });

    afterAll(() => {
      subscription.unsubscribe();
      RTCMessage = undefined;
    });

    it("should be received when one record updated", (done) => {
      subscription = dom.dataset(datasetName)
        .watch("deleted")
        .subscribe((message) => {
          RTCMessage = message;
          expect(RTCMessage).toBeDefined();
          done();
        });

      dom.dataset(datasetName)
        .delete()
        .where((field) => field("id").isEqualTo(recordId))
        .execute();
    });

  });

});
