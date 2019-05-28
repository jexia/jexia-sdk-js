// tslint:disable:no-string-literal
import * as faker from "faker";
import * as FormData from "form-data";
import { createMockFor, deepClone, fetchWithRequestMockOk, validClientOpts } from "../../../spec/testUtils";
import { jexiaClient } from "../../node";
import { FileOperationsModule } from "./fileOperationsModule";
import { Fileset } from "./fileset";

describe("File Operations Module", () => {

  const createSubject = ({
    formDataMock = createMockFor(FormData),
    client = jexiaClient(fetchWithRequestMockOk),
    config = {
      subscribeForTheFileUploading: false,
      uploadTimeout: 120000
    }
  } = {}) => {
    const subject = new FileOperationsModule(formDataMock, config);
    return {
      subject,
      formDataMock,
      client,
      moduleInit() {
        return client.init(deepClone(validClientOpts), subject);
      },
    };
  };

  describe("when initializing", () => {
    it("should resolve initialization automatically after configure the injector", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      expect(subject["injector"]).toBeDefined();
    });
  });

  describe("when gets a fileset", () => {
    it("should update auth options if auth alias is provided", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      const fileset = subject.fileset("testFileset", "testAlias");
      const fileUploaderConfig = fileset["fileUploader"]["config"];
      expect(fileUploaderConfig.auth).toEqual("testAlias");
    });

    it("should not update auth options if auth alias is not provided)", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      const fileset = subject.fileset("testFileset");
      const fileUploaderConfig = fileset["fileUploader"]["config"];
      expect(fileUploaderConfig.auth).not.toBeDefined();
    });

    it("should get fileset with the same name", async () => {
      const filesetName = faker.random.word();
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      expect(subject.fileset(filesetName).name).toEqual(filesetName);
    });

    it("should not have fileset in injector without providing a name", async () => {
      const { subject, moduleInit } = createSubject();
      await moduleInit();
      expect(() => subject["injector"].get(Fileset)).toThrow("No provider for Fileset!");
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
