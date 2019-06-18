import * as faker from "faker";
import { QueryParam } from "../executer.interfaces";
import {
  attachRelation,
  linkRelation,
  RelationLinkType,
} from "./relations";

const createQueryParam = () => ({ key: faker.random.word(), value: faker.lorem.sentence() });
const randomRelationLinkType = () => faker.helpers.randomize([
  RelationLinkType.ATTACH,
]);
const randomQueryParams = (): QueryParam[] => Array.from(
  { length: faker.random.number({ min: 1, max: 5 }) },
  () => createQueryParam()
);
const randomCondition  = () => faker.helpers.randomize([faker.random.word(), faker.random.number()]);

describe("Link relations", () => {
  it(`should concat props to query params array`, () => {
    const resourceName = faker.random.word();
    const relationLinkType = randomRelationLinkType();
    const originalQueryParams = randomQueryParams();
    const condition = randomCondition();

    expect(linkRelation(originalQueryParams, resourceName, relationLinkType, condition)).toEqual(
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

    expect(linkRelation([], resourceName, relationLinkType, condition)).toEqual([
      { key: "action", value: relationLinkType, },
      { key: "action_resource", value: resourceName, },
      { key: "action_cond", value: condition, },
    ]);
  });
});

describe("Attach relations", () => {
  it(`should have the same result as "linkRelations"`, () => {
    const resourceName = faker.random.word();
    const originalQueryParams = randomQueryParams();
    const condition = randomCondition();
    const expectedResult = linkRelation(originalQueryParams, resourceName, RelationLinkType.ATTACH, condition);

    expect(attachRelation(originalQueryParams, resourceName, condition)).toEqual(expectedResult);
  });
});
