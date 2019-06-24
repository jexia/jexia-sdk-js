// tslint:disable:no-string-literal
import * as faker from "faker";
import { createMockFor } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { InsertQuery } from "../core/queries/insertQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { ResourceType } from "../core/resource";
import { ActionQuery } from "./../core/queries/actionQuery";
import { Dataset } from "./dataset";
import { field } from "./filteringApi";

describe("Dataset class", () => {
  describe("after initiating", () => {
    it("should have correct resource type", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      expect(dataset.resourceType).toEqual(ResourceType.Dataset);
    });

    it("dataset name should be set", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      expect(dataset.name).toEqual("test");
    });

    it("requestExecuter should be set", () => {
      const requestExecuter = createMockFor(RequestExecuter);
      const dataset = new Dataset("test", requestExecuter);
      expect((dataset as any).requestExecuter).toEqual(requestExecuter);
    });
  });

  it("should be able start a select query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.select() instanceof SelectQuery).toBeTruthy();
  });

  it("should be able start a update query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.update({}) instanceof UpdateQuery).toBeTruthy();
  });

  it("should be able start a insert query with an array of records", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.insert([{}]) instanceof InsertQuery).toBeTruthy();
  });

  it("should be able start a insert query with a single record", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.insert({}) instanceof InsertQuery).toBeTruthy();
  });

  it("should be able start a delete query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.delete() instanceof DeleteQuery).toBeTruthy();
  });

  it("should throw an error when try to use the watch method without the real time module", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(() => (dataset as any).watch()).toThrow();
  });

  describe("On attach", () => {
    it("should return the query by passing a filter", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      const query = dataset.attach(
        faker.random.word(),
        field(faker.random.alphaNumeric()).isEqualTo(faker.random.word()),
      );

      expect(query instanceof ActionQuery).toBeTruthy();
    });

    it("should return the query without passing a filter", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      const query = dataset.attach(faker.random.word());

      expect(query instanceof ActionQuery).toBeTruthy();
    });
  });

});
