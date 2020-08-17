import * as faker from "faker";
import { parseQueryParams } from "./queryParam";

describe("parseQueryParams method", () => {
  it("should return empty string when argument is empty", () => {
    expect(parseQueryParams(undefined)).toBe("");
  });

  it("should parse to the correct format for non-string values", () => {
    const key = faker.random.word();
    const value = faker.helpers.randomize([
      [],
      faker.random.number(),
      {},
      faker.random.boolean(),
    ]);

    const queryParams = [
      { key, value },
    ];

    const encodeValue = (v: any) => encodeURIComponent(JSON.stringify(v));
    const expectedParams = `?${key}=${encodeValue(value)}`;

    expect(parseQueryParams(queryParams)).toEqual(expectedParams);
  });

  it("should parse to the correct format for string values", () => {
    const key = faker.random.word();
    const value = faker.random.words();

    const queryParams = [
      { key, value },
    ];

    const encodeValue = (v: any) => encodeURIComponent(v);

    const expectedParams = `?${key}=${encodeValue(value)}`;

    expect(parseQueryParams(queryParams)).toEqual(expectedParams);
  });

  it("should separate params by ampersand", () => {
    const key1 = faker.random.word();
    const key2 = faker.random.word();
    const key3 = faker.random.word();

    const queryParams = [
      { key: key1, value: faker.random.number() },
      { key: key2, value: faker.random.number() },
      { key: key3, value: faker.random.number() },
    ];

    const result: string = parseQueryParams(queryParams);

    expect(result.split("&").length).toEqual(queryParams.length);
  });
});
