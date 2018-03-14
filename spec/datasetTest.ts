import { Dataset } from "../src/api/dataops/dataset";
import { RequestExecuter } from "../src/internal/executer";
import { createMockFor } from "./testUtils";

describe("Dataset class", () => {

  describe("when instantiating a dataset object directly", () => {
    it("should create a valid object", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      expect(dataset).toBeDefined();
    });
  });

  describe("when instantiating a dataset object directly", () => {
    it("should be able to call required methods on dataset", () => {
      const dataset = new Dataset("test", createMockFor(RequestExecuter));
      expect(dataset.select()).toBeDefined();
    });
  });

});
