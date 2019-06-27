import * as faker from "faker";
import { createRequestExecuterMock, getRandomResourceType } from "../../../../spec/testUtils";
import { RequestMethod } from "../../../internal/requestAdapter.interfaces";
import { InsertQuery } from "./insertQuery";

describe("InsertQuery class", () => {
  const resourceName = faker.random.word();
  const resourceType = getRandomResourceType();
  let qe: any;
  let subject: InsertQuery<any, any>;

  const fakeRecord = {
    title: faker.random.words(3),
    user_id: faker.random.uuid(),
  };

  beforeEach(() => {
    qe = createRequestExecuterMock();
    subject = new InsertQuery(qe, [fakeRecord], resourceType, resourceName);
  });

  describe("when instantiating a insertQuery object directly", () => {
    it("should be able to return required object", () => {
      expect(subject).toBeDefined();
    });
  });

  it("should execute the query with the correct parameters", () => {
    spyOn(qe, "executeRequest");
    subject.execute();
    expect(qe.executeRequest).toHaveBeenLastCalledWith({
      method: RequestMethod.POST,
      body: [fakeRecord],
      resourceType,
      resourceName
    });
  });
});
