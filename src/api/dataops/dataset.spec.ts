import { createMockFor } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { Dataset } from "./dataset";
import { DeleteQuery } from "./queries/deleteQuery";
import { InsertQuery } from "./queries/insertQuery";
import { SelectQuery } from "./queries/selectQuery";
import { UpdateQuery } from "./queries/updateQuery";

describe("Dataset class", () => {
  describe("after initiating", () => {
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

  it("should be able start a insert query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.insert([{}]) instanceof InsertQuery).toBeTruthy();
  });

  it("should be able start a delete query", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(dataset.delete() instanceof DeleteQuery).toBeTruthy();
  });

});
