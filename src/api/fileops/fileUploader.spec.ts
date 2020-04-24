import * as faker from "faker";
import { of, Subject } from "rxjs";
import { createMockFor, mockFilesList } from "../../../spec/testUtils";
import { RequestAdapter } from "../../internal/requestAdapter";
import { TokenManager } from "../core/tokenManager";
import { IFormData } from "./fileops.interfaces";
import { FileUploader } from "./fileUploader";

let formDataAppendSpy: jasmine.Spy;

class TestFormData implements IFormData<unknown> {
  constructor(public createdAutomatically = true) {
    this.append = formDataAppendSpy;
  }

  // tslint:disable-next-line:no-empty
  public append(name: string, value: string | unknown, filename?: string) {
  }
}

const testHeader = faker.random.word();

// tslint:disable-next-line:max-classes-per-file
class TestFormDataWithHeaders extends TestFormData {

  public getHeaders() {
    return { testHeader };
  }
}

describe("fileUploader", () => {
  function createSubject({
    // @ts-ignore
    projectID = faker.random.uuid(),
    config = { projectID },
    filesetName = faker.random.word(),
    // @ts-ignore
    token = faker.random.word(),
    tokenManagerMock = createMockFor(TokenManager, { returnValue: of(token) }),
    requestAdapterMock = createMockFor(RequestAdapter, { returnValue: of([]) }),
    FormDataMock = TestFormData,
  } = {}) {
    const subject = new FileUploader(config, filesetName, tokenManagerMock, requestAdapterMock);
    formDataAppendSpy = jasmine.createSpy("append");
    subject.provideFormData(new FormDataMock());
    return {
      projectID,
      config,
      filesetName,
      tokenManagerMock,
      token,
      requestAdapterMock,
      subject
    };
  }

  describe("on init", () => {
    it("should have provided config", () => {
      const { subject, config } = createSubject();
      expect((subject as any).config).toEqual(config);
    });

    it("should have provided fileset name", () => {
      const { subject, filesetName } = createSubject();
      expect((subject as any).filesetName).toEqual(filesetName);
    });
  });

  describe("when providing a form data object", () => {
    it("should create it from constructor", () => {
      const { subject } = createSubject();
      expect((subject as any).formData.createdAutomatically).toBeTruthy();
    });
  });

  describe("upload method", () => {
    it("should return merged observable of every file uploading process", (done) => {
      const { subject } = createSubject();
      const files = mockFilesList(faker.random.number({min: 1, max: 5}));
      const fileUploads = files.map(() => ({
        result: faker.random.word(),
        subject: new Subject()
      }));
      spyOn(subject as any, "uploadFile").and.returnValues(...fileUploads.map((f) => f.subject));

      const results: any[] = [];
      subject.upload(files).subscribe(
        (result: any) => results.push(result),
        done,
        () => {
          expect(results).toEqual(fileUploads.map((f) => f.result));
          done();
        });

      fileUploads.forEach((f) => {
        f.subject.next(f.result);
        f.subject.complete();
      });
    });
  });

  describe("upload a file", () => {
    it("should append all custom fields to the form data as `data` property", () => {
      const { subject } = createSubject();
      const data = {
        customField: faker.lorem.sentence(5)
      };
      (subject as any).uploadFile({ data });
      expect(formDataAppendSpy).toHaveBeenCalledWith("data", JSON.stringify(data));
    });

    it("should append an empty object if there is no custom fields", () => {
      const { subject } = createSubject();
      (subject as any).uploadFile({});
      expect(formDataAppendSpy).toHaveBeenCalledWith("data", "{}");
    });

    it("should append a file", () => {
      const { subject } = createSubject();
      const file = faker.internet.avatar();
      (subject as any).uploadFile({ file });
      expect(formDataAppendSpy).toHaveBeenCalledWith("file", file);
    });

    it("should pick a token according to config auth options", (done) => {
      const { subject, tokenManagerMock } = createSubject({
        config: { auth: "auth" } as any
      });
      (subject as any).uploadFile({}).subscribe({
        error: done,
        complete: () => {
          expect(tokenManagerMock.token).toHaveBeenCalledWith("auth");
          done();
        }
      });
    });

    it("should execute request with correct token", (done) => {
      const { subject, token } = createSubject();
      spyOn(subject as any, "execute").and.callThrough();
      (subject as any).uploadFile({}).subscribe({
        error: done,
        complete: () => {
          expect((subject as any).execute).toHaveBeenCalledWith(token, expect.anything());
          done();
        }
      });
    });

    it("it take headers from form data if it has them", (done) => {
      const {
        subject,
        requestAdapterMock,
        token } = createSubject({ FormDataMock: TestFormDataWithHeaders });
      (subject as any).uploadFile({}).subscribe({
        error: done,
        complete: () => {
          expect(requestAdapterMock.upload).toHaveBeenCalledWith(
            (subject as any).getUrl(),
            {
              Authorization: `Bearer ${token}`,
              testHeader,
            },
            expect.anything()
          );
          done();
        }
      });
    });

    it("should make a correct API request", (done) => {
      const { subject, token, requestAdapterMock } = createSubject();
      (subject as any).uploadFile({}).subscribe({
        error: done,
        complete: () => {
          expect(requestAdapterMock.upload).toHaveBeenCalledWith(
            (subject as any).getUrl(),
            {
              Authorization: `Bearer ${token}`,
            },
            expect.any(TestFormData)
          );
          done();
        }
      });
    });

    it("should return an error in case of file upload error", (done) => {
      const uploadError = "Upload file error";
      const { subject } = createSubject({
        requestAdapterMock: createMockFor(RequestAdapter, { returnValue: Promise.reject(uploadError) })
      });
      (subject as any).uploadFile({}).subscribe({
        error: (error: string) => {
          expect(error).toEqual(uploadError);
          done();
        },
        complete: () => done("uploading file has completed without throwing an error")
      });
    });

  });

});
