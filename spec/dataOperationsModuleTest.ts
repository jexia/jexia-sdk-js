// tslint:disable:no-string-literal
// tslint:disable:no-empty
import { DataOperationsModule } from "../src/api/dataops/dataOperationsModule";
import { Dataset, jexiaClient } from "../src/node";
import { fetchWithRequestMockOk, validClientOpts } from "./testUtils";

describe("Real Time Module", () => {

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

  describe("when terminating", () => {

    it("should resolve automatically", async () => {
      const { subject } = createSubject();
      const result = await subject.terminate();
      expect(result).toBe(subject);
    });

  });

});
