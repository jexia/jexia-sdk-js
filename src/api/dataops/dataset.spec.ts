// tslint:disable:no-string-literal
import { createMockFor } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { Dataset } from "./dataset";
import { DeleteQuery } from "./deleteQuery";
import { InsertQuery } from "./insertQuery";
import { SelectQuery } from "./selectQuery";
import { UpdateQuery } from "./updateQuery";

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

  it("should throw an error when try to use the watch method without the real time module", () => {
    const dataset = new Dataset("test", createMockFor(RequestExecuter));
    expect(() => dataset["watch"]()).toThrow();
  });

});
