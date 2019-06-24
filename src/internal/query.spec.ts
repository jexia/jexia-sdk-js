import * as faker from "faker";
import { getRandonQueryActionType, randomFilteringCriteria } from "../../spec/testUtils";
import { FilteringCriterion, toFilteringCriterion } from "../api/dataops/filteringApi";
import { FilteringCondition } from "../api/dataops/filteringCondition";
import { IAggField, Query } from "./query";

describe("Query class", () => {
  let query: Query;
  const filteringCondition = new FilteringCondition("field", "=", ["test"]);
  const filteringCriterion = new FilteringCriterion(filteringCondition);
  type ISort = { direction: "asc" | "desc", fields: string[]};
  let sortWithoutFields: ISort = {
    direction: "asc",
    fields: [],
  };
  let sort1: ISort = {
    direction: "asc",
    fields: ["field1", "field2"],
  };
  let sort2: ISort = {
    direction: "desc",
    fields: ["field3"],
  };

  beforeEach(() => {
    query = new Query();
  });

  describe("should have initial attributes", () => {
    it("empty fields", () => {
      expect(query.fields).toEqual([]);
    });
    it("undefined limit", () => {
      expect(query.limit).toBeUndefined();
    });
    it("undefined offset", () => {
      expect(query.offset).toBeUndefined();
    });
    it("undefined filtering conditions", () => {
      expect((query as any).filteringConditions).toBeUndefined();
    });
    it("empty orders array", () => {
      expect((query as any).orders).toEqual([]);
    });
  });

  describe("setFilteringCriteria method", () => {
    it("should set filtering conditions", () => {
      query.setFilterCriteria(filteringCriterion);
      expect((query as any).filteringConditions).toEqual(filteringCondition);
    });
  });

  describe("addSortCondition method", () => {
    it("should throw an error if fields are empty", () => {
      expect(() => query.addSortCondition(sortWithoutFields.direction, ...sortWithoutFields.fields)).toThrow();
    });
    it("should push sort object into orders", () => {
      query.addSortCondition(sort1.direction, ...sort1.fields);
      expect((query as any).orders).toEqual([sort1]);
    });
    it("should accumulate values", () => {
      query.addSortCondition(sort1.direction, ...sort1.fields);
      query.addSortCondition(sort2.direction, ...sort2.fields);
      expect((query as any).orders).toEqual([sort1, sort2]);
    });
  });

  describe("On setAction", () => {
    it("should compile with no condition", () => {
      const queryActionType = getRandonQueryActionType();
      const actionResource = faker.random.alphaNumeric();

      query.setAction(queryActionType, actionResource);

      expect(query.compile()).toEqual({
        action: queryActionType,
        action_resource: actionResource,
      });
    });

    it("should compile with condition", () => {
      const queryActionType = getRandonQueryActionType();
      const actionResource = faker.random.alphaNumeric();
      const filter = randomFilteringCriteria();

      query.setAction(queryActionType, actionResource, filter);

      expect(query.compile()).toEqual({
        action: queryActionType,
        action_resource: actionResource,
        action_cond: toFilteringCriterion(filter).condition.compile(),
      });
    });
  });

  describe("should compile", () => {
    it("empty query to empty object", () => {
      expect(query.compile()).toEqual({});
    });

    it("filtering conditions", () => {
      query.setFilterCriteria(filteringCriterion);
      expect(query.compile()).toEqual({
        cond: (query as any).filteringConditions.compile(),
      });
    });
    it("limit option", () => {
      query.limit = 10;
      expect(query.compile()).toEqual({
        range: { limit: 10 },
      });
    });
    it("offset option", () => {
      query.offset = 20;
      expect(query.compile()).toEqual({
        range: { offset: 20 },
      });
    });
    it("limit and offset together", () => {
      query.limit = 10;
      query.offset = 20;
      expect(query.compile()).toEqual({
        range: { limit: 10, offset: 20 },
      });
    });

    describe("fields option should compile", () => {
      it("simple string fields", () => {
        query.fields = ["field1", "field2"];
        expect(query.compile()).toEqual({
          outputs: ["field1", "field2"],
        });
      });
      it("aggregation method", () => {
        const aggField: IAggField<any> = { fn: "MAX", col: "field1"};
        query.fields = [aggField];
        expect(query.compile()).toEqual({
          outputs: ["MAX(field1)"],
        });
      });
      it("aggregation method with asterisk to id", () => {
        const aggField: IAggField<any> = { fn: "COUNT", col: "*"};
        query.fields = [aggField];
        expect(query.compile()).toEqual({
          outputs: ["COUNT(id)"],
        });
      });
      it("mixed fields", () => {
        const aggField: IAggField<any> = { fn: "MAX", col: "field3"};
        query.fields = ["field1", "field2", aggField, "field4"];
        expect(query.compile()).toEqual({
          outputs: ["field1", "field2", "MAX(field3)", "field4"],
        });
      });
      it("wrong * usage to throwing an error", () => {
        const aggField: IAggField<any> = { fn: "SUM", col: "*"};
        query.fields = [aggField];
        expect(() => query.compile()).toThrow("Field name should be provided with the SUM function");
      });
    });

    it("sort option", () => {
      query.addSortCondition(sort1.direction, ...sort1.fields);
      query.addSortCondition(sort2.direction, ...sort2.fields);
      expect(query.compile()).toEqual({
        order: [sort1, sort2],
      });
    });
  });

  describe("should compile to query params", () => {
    it("empty query to empty array", () => {
      expect(query.compileToQueryParams()).toEqual([]);
    });

    it("should transform all compiled entries", () => {
      const fakeCompiled = {
        key1: faker.random.word(),
        key2: faker.random.word(),
      };
      spyOn(query, "compile").and.returnValue(fakeCompiled);

      expect(query.compileToQueryParams().length)
        .toEqual(Object.keys(fakeCompiled).length);
    });

    it("should transform any entry to the correct format", () => {
      const keyArray = faker.helpers.randomize(["field", "populate", "cond"]);
      const fakeCompiled = {
        [keyArray]: [
          faker.random.number(),
          faker.random.objectElement(),
        ],
      };
      spyOn(query, "compile").and.returnValue(fakeCompiled);

      expect(query.compileToQueryParams()).toEqual([
        { key: keyArray, value: fakeCompiled[keyArray] },
      ]);
    });

    it("should transform 'order' entry to the correct format", () => {
      const fakeCompiled = {
        order: [
          faker.random.word(),
          faker.random.word(),
        ],
      };
      spyOn(query, "compile").and.returnValue(fakeCompiled);

      expect(query.compileToQueryParams()).toEqual([
        { key: "order", value: fakeCompiled.order[0] },
        { key: "order", value: fakeCompiled.order[1] },
      ]);
    });
  });
});
