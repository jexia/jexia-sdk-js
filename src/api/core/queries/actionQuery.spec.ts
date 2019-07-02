import * as faker from "faker";
import {
  createRequestExecuterMock,
  getRandomFilteringCriteria,
  getRandomQueryActionType,
  getRandomResourceType,
} from "../../../../spec/testUtils";
import { QueryActionType, toQueryParams } from "../../../internal/utils";
import { field, toFilteringCriterion } from "../../dataops/filteringApi";
import { ActionQuery } from "./actionQuery";

describe("ActionQuery class", () => {
  function createSubject({
    requestExecuterMock = createRequestExecuterMock(),
    actionResourceName = faker.random.word(),
    filter = getRandomFilteringCriteria(),
    queryActionType = getRandomQueryActionType(),
  } = {}) {
    const subject = new ActionQuery(
      requestExecuterMock,
      getRandomResourceType(),
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

  function getExpectedQueryParams(
    queryActionType: QueryActionType,
    actionResourceName: string,
    filter: any,
  ) {
    return toQueryParams({
      action: queryActionType,
      action_resource: actionResourceName,
      action_cond: toFilteringCriterion(filter).condition.compile(),
    });
  }

  function fakeList(factory: () => any): any {
    return Array.from(
      { length: faker.random.number({ min: 1, max: 5 }) },
      factory,
    );
  }

  it("should add props to query params by passing filter criterion", () => {
    const {
      subject,
      requestExecuterMock,
      actionResourceName,
      filter,
      queryActionType,
    } = createSubject();

    const expectedQueryParams = getExpectedQueryParams(
      queryActionType,
      actionResourceName,
      filter,
    );

    subject.execute();

    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: expectedQueryParams,
      }),
    );
  });

  it("should add props to query params by passing an array of ids", () => {
    const fakeIdsList = fakeList(() => faker.random.uuid());

    const {
      subject,
      requestExecuterMock,
      actionResourceName,
      queryActionType,
    } = createSubject({
      filter: fakeIdsList,
    });

    const expectedQueryParams = getExpectedQueryParams(
      queryActionType,
      actionResourceName,
      field("id").isInArray(fakeIdsList),
    );

    subject.execute();

    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: expectedQueryParams,
      }),
    );
  });

  it("should add props to query params by passing an array of objects with id", () => {
    const fakeObjectsWithIdList = fakeList(() => ({ id: faker.random.uuid() }));

    const {
      subject,
      requestExecuterMock,
      actionResourceName,
      queryActionType,
    } = createSubject({
      filter: fakeObjectsWithIdList,
    });

    const ids = fakeObjectsWithIdList.map((o: any) => o.id);

    const expectedQueryParams = getExpectedQueryParams(
      queryActionType,
      actionResourceName,
      field("id").isInArray(ids),
    );

    subject.execute();

    expect(requestExecuterMock.executeRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        queryParams: expectedQueryParams,
      }),
    );
  });

  describe("When passing invalid types", () => {
    const randomInvalid = () => faker.helpers.randomize(["", undefined, null]);
    function testError(filter: any) {
      const create = createSubject.bind(null, { filter });

      expect(create).toThrow("Invalid resource or id list: " + filter);
    }

    it("should throw error for list with invalid id", () => {
      testError([
        randomInvalid(),
        faker.random.uuid(),
      ]);
    });

    it("should throw error for list with invalid object id", () => {
      testError([
        { id: randomInvalid() },
        { id: faker.random.uuid() },
      ]);
    });

    it("should throw error for list with mixed types", () => {
      testError([
        { id: faker.random.uuid() },
        faker.random.uuid(),
      ]);
    });
  });

});
