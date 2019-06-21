import * as faker from "faker";
import { addActionParams, QueryActionType, QueryParam } from "./";

const createQueryParam = () => ({ key: faker.random.word(), value: faker.lorem.sentence() });
const randomRelationLinkType = () => faker.helpers.randomize([
  QueryActionType.ATTACH,
]);
const randomQueryParams = (): QueryParam[] => Array.from(
  { length: faker.random.number({ min: 1, max: 5 }) },
  () => createQueryParam()
);
const randomCondition  = () => faker.helpers.randomize([faker.random.word(), faker.random.number()]);

describe("QueryAction", () => {
  it(`should concat props to query params array`, () => {
    const resourceName = faker.random.word();
    const relationLinkType = randomRelationLinkType();
    const originalQueryParams = randomQueryParams();
    const condition = randomCondition();

    expect(addActionParams(originalQueryParams, resourceName, relationLinkType, condition)).toEqual(
      originalQueryParams.concat([
        { key: "action", value: relationLinkType, },
        { key: "action_resource", value: resourceName, },
        { key: "action_cond", value: condition, },
      ])
    );
  });

  it(`should concat props to an empty array`, () => {
    const resourceName = faker.random.word();
    const relationLinkType = randomRelationLinkType();
    const condition = randomCondition();

    expect(addActionParams([], resourceName, relationLinkType, condition)).toEqual([
      { key: "action", value: relationLinkType, },
      { key: "action_resource", value: resourceName, },
      { key: "action_cond", value: condition, },
    ]);
  });
});
