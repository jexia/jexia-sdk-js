import * as faker from "faker";
import {
  createRequestExecuterMock,
  getRandonQueryActionType,
  randomFilteringCriteria,
} from "../../../../spec/testUtils";
import { toQueryParams } from "../../../internal/utils";
import { toFilteringCriterion } from "../../dataops/filteringApi";
import { ResourceType } from "../resource";
import { ActionQuery } from "./actionQuery";

describe("ActionQuery class", () => {
  function createSubject({
    requestExecuterMock = createRequestExecuterMock(),
    actionResourceName = faker.random.word(),
    filter = randomFilteringCriteria(),
    queryActionType = getRandonQueryActionType(),
  } = {}) {
    const subject = ActionQuery.create(
      requestExecuterMock,
      faker.helpers.randomize([ResourceType.Dataset, ResourceType.Fileset]),
      faker.random.word(),
      actionResourceName,
      queryActionType,
      filter,
    );

    return {
      requestExecuterMock,
      actionResourceName,
      filter,
      subject,
      queryActionType,
    };
  }

  it("should add props to query params by passing a filter", () => {
    const {
      subject,
      requestExecuterMock,
      actionResourceName,
      filter,
      queryActionType,
    } = createSubject();

    spyOn(requestExecuterMock, "executeRequest");

    const expectedQueryParams = toQueryParams({
      action: queryActionType,
      action_resource: actionResourceName,
      action_cond: toFilteringCriterion(filter).condition.compile(),
    });

    subject.execute();

    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: expectedQueryParams,
      }),
    );
  });
});
