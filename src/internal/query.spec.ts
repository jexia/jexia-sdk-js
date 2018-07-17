import { FilteringCriterion } from "../api/dataops/filteringApi";
import { FilteringCondition } from "../api/dataops/filteringCondition";
import { Query } from "./query";

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
  let query1 = new Query("dataset1");
  let query2 = new Query("dataset2");

  beforeEach(() => {
    query = new Query("dataset");
  });

  describe("should have initial attributes", () => {
    it("undefined fields", () => {
      expect(query.fields).toBeUndefined();
    });
    it("undefined limit", () => {
      expect(query.limit).toBeUndefined();
    });
    it("undefined offset", () => {
      expect(query.offset).toBeUndefined();
    });
    it("undefined data", () => {
      expect(query.data).toBeUndefined();
    });
    it("empty relations array", () => {
      expect((query as any).relations).toEqual([]);
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

  describe("addRelation method", () => {
    it("should push relation into an array", () => {
      query.addRelation(query1);
      expect((query as any).relations).toEqual([query1]);
    });
    it("should accumulate values", () => {
      query.addRelation(query1);
      query.addRelation(query2);
      expect((query as any).relations).toEqual([query1, query2]);
    });
  });

  describe("should compile", () => {
    it("empty query to empty object", () => {
      expect(query.compile()).toEqual({});
    });
    it("filtering conditions", () => {
      query.setFilterCriteria(filteringCriterion);
      expect(query.compile()).toEqual({
        conditions: [(query as any).filteringConditions.compile()],
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
    it("fields option", () => {
      query.fields = ["field1", "field2"];
      expect(query.compile()).toEqual({
        fields: ["field1", "field2"],
      });
    });
    it("sort option", () => {
      query.addSortCondition(sort1.direction, ...sort1.fields);
      query.addSortCondition(sort2.direction, ...sort2.fields);
      expect(query.compile()).toEqual({
        orders: [sort1, sort2],
      });
    });
    it("data option", () => {
      query.data = "test";
      expect(query.compile()).toEqual({
        data: "test",
      });
    });
    it("relations option", () => {
      query.addRelation(query1);
      query.addRelation(query2);
      expect(query.compile()).toEqual({
        relations: {
          "dataset1": query1.compile(),
          "dataset2": query2.compile(),
        },
      });
    });
  });
});
