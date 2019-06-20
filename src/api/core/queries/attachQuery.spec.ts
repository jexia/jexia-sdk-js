import * as faker from "faker";
import { createRequestExecuterMock, randomFilteringCriteria } from "../../../../spec/testUtils";
import { attachRelation } from "../../../internal/utils";
import { toFilteringCriterion } from "../../dataops/filteringApi";
import { ResourceType } from "../resource";
import { AttachQuery } from "./attachQuery";

describe("AttachQuery class", () => {
  function createSubject({
    requestExecuterMock = createRequestExecuterMock(),
    attachedResourceName = faker.random.word(),
    filter = randomFilteringCriteria(),
  } = {}) {
    const subject = new AttachQuery(
      requestExecuterMock,
      faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
      faker.random.word(),
      attachedResourceName,
      filter,
    );

    return {
      requestExecuterMock,
      attachedResourceName,
      filter,
      subject,
    };
  }

  it("should add props to query params by passing a filter", () => {
    const { subject, requestExecuterMock, attachedResourceName, filter } = createSubject();
    spyOn(requestExecuterMock, "executeRequest");
    const expectedQueryParams = attachRelation(
      [],
      attachedResourceName,
      toFilteringCriterion(filter).condition.compile(),
    );

    subject.execute();

    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: expectedQueryParams,
      }),
    );
  });
});
