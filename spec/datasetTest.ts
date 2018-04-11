import { Dataset } from "../src/api/dataops/dataset";
import { DeleteQuery } from "../src/api/dataops/deleteQuery";
import { InsertQuery } from "../src/api/dataops/insertQuery";
import { SelectQuery } from "../src/api/dataops/selectQuery";
import { UpdateQuery } from "../src/api/dataops/updateQuery";
import { RequestExecuter } from "../src/internal/executer";
import { createMockFor } from "./testUtils";

describe("Dataset class", () => {

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
