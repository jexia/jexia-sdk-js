import * as faker from "faker";
import { createRequestExecuterMock } from "../../../../spec/testUtils";
import { InsertQuery } from "./insertQuery";

describe("InsertQuery class", () => {
  let projectID: string;
  let dataset: string;
  let qe;
  let subject: InsertQuery<any, any>;

  const fakeRecord = {
    title: faker.random.words(3),
    user_id: faker.random.uuid(),
  };

  beforeAll(() => {
    dataset = "dataset";
    projectID = "projectID";
  });

  beforeEach(() => {
    qe = createRequestExecuterMock(projectID, dataset);
    subject = new InsertQuery(qe, [fakeRecord], dataset);
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
      action: subject.action,
      body: [fakeRecord],
    });
  });
});
