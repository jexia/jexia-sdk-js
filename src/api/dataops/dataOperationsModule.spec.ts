// tslint:disable:no-string-literal
import { fetchWithRequestMockOk, validClientOpts } from "../../../spec/testUtils";
import { Dataset, jexiaClient } from "../../node";
import { DataOperationsModule } from "./dataOperationsModule";

describe("Data Operations Module", () => {

  function createSubject({
    client = jexiaClient(fetchWithRequestMockOk),
  } = {}) {
    const subject = new DataOperationsModule();
    return {
      client,
      subject,
      moduleInit() {
        return client.init(validClientOpts, subject);
      },
    };
  }

  describe("when initializing", () => {

    it("should resolve initialization automatically after configure the injector", async () => {
      const { subject, moduleInit } = createSubject();
      const initPromise = moduleInit();
      expect(subject["injector"]).toBeTruthy();
      await initPromise;
    });

    it("should not create a Dataset instance without a DataSetName", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      expect(() => subject["injector"].get(Dataset)).toThrow();
    });

  });

  describe("when gets a dataset", () => {

    it("should not create a Dataset instance without a DataSetName", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      const datasetName = "testDatasetName";
      const dataset = subject.dataset(datasetName);
      expect(dataset).toBeInstanceOf(Dataset);
      expect(dataset.name).toBe(datasetName);
    });

  });

  describe("when gets a list of datasets", () => {
    it("should return correct dataset list", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();

      const names = ["d1", "d2", "d3"];
      const datasets = subject.datasets(names);

      datasets.forEach((dataset, index) => {
        expect(dataset).toBeInstanceOf(Dataset);
        expect(dataset.name).toEqual(names[index]);
      });
    });
  });

  describe("when gets a module config", () => {

    it("should return an empty config", () => {
      const { subject } = createSubject();
      expect(subject.getConfig()).toEqual({ dataOperations: {} });
    });
  });

  describe("when terminating", () => {

    it("should resolve automatically", async () => {
      const { subject } = createSubject();
      const result = await subject.terminate();
      expect(result).toBe(subject);
    });

  });

});
