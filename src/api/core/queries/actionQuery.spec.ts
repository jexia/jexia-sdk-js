import * as faker from "faker";
import { createRequestExecuterMock, randomFilteringCriteria } from "../../../../spec/testUtils";
import { addActionParams, QueryActionType } from "../../../internal/utils";
import { toFilteringCriterion } from "../../dataops/filteringApi";
import { ResourceType } from "../resource";
import { ActionQuery } from "./actionQuery";

describe("ActionQuery class", () => {
  function createSubject({
    requestExecuterMock = createRequestExecuterMock(),
    attachedResourceName = faker.random.word(),
    filter = randomFilteringCriteria(),
    relationType = faker.helpers.randomize([
      QueryActionType.ATTACH,
      QueryActionType.DETACH,
    ]),
  } = {}) {
    const subject = new ActionQuery(
      requestExecuterMock,
      faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
      faker.random.word(),
      attachedResourceName,
      relationType,
      filter,
    );

    return {
      requestExecuterMock,
      attachedResourceName,
      filter,
      subject,
      relationType,
    };
  }

  it("should add props to query params by passing a filter", () => {
    const {
      subject,
      requestExecuterMock,
      attachedResourceName,
      filter,
      relationType,
    } = createSubject();

    spyOn(requestExecuterMock, "executeRequest");
    const expectedQueryParams = addActionParams(
      [],
      attachedResourceName,
      relationType,
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
