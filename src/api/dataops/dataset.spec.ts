// tslint:disable:no-string-literal
import * as faker from "faker";
import { createMockFor } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { AttachQuery } from "../core/queries/attachQuery";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { InsertQuery } from "../core/queries/insertQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { ResourceType } from "../core/resource";
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

  it("should be able start an attach query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    const attachQuery = dataset.attach(faker.random.word(), field("id").isEqualTo("someId"));

    expect(attachQuery instanceof AttachQuery).toBeTruthy();
  });

  it("should throw an error when try to use the watch method without the real time module", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(() => (dataset as any).watch()).toThrow();
  });

});
