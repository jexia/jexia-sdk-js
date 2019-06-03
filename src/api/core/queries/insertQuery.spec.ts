import * as faker from "faker";
import { createRequestExecuterMock } from "../../../../spec/testUtils";
import { ResourceType } from "../resource";
import { InsertQuery } from "./insertQuery";

describe("InsertQuery class", () => {
  const resourceName = faker.random.word();
  const resourceType = faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]);
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

  describe("when instantiating a insertQuery object from client", () => {
    it("should be able to invoke methods exposed by it", () => {
      expect(typeof subject.execute).toBe("function");
    });
  });

  it("should execute the query with the correct parameters", () => {
    spyOn(qe, "executeRequest");
    subject.execute();
    expect(qe.executeRequest).toHaveBeenLastCalledWith({
      action: (subject as any).action,
      body: [fakeRecord],
      resourceType,
      resourceName
    });
  });
});
