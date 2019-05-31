import * as faker from "faker";
import { of, Subject } from "rxjs";
import { createMockFor, mockFileEvent, mockFileRecord, mockFilesList } from "../../../spec/testUtils";
import { RequestExecuter } from "../../internal/executer";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { ResourceType } from "../core/resource";
import { RealTimeEventMessage } from "../realtime/realTime.interfaces";
import { FilesetInterface, IFileStatus } from "./fileops.interfaces";
import { Fileset } from "./fileset";
import { FileUploader } from "./fileUploader";

describe("Fileset", () => {

  function createSubject({
    filesetName = faker.random.word(),
    fsConfig = { uploadWaitForCompleted: false, uploadTimeout: 120000 },
    // @ts-ignore
    fileUploadReturnValue = of({}),
    fileUploaderMock = createMockFor(FileUploader, { returnValue: fileUploadReturnValue }),
    requestExecuterMock = createMockFor(RequestExecuter),
  } = {}) {
    const subject = new Fileset(filesetName, { fileOperations: fsConfig }, fileUploaderMock, requestExecuterMock);
    return {
      subject,
      filesetName,
      fileUploaderMock,
      fileUploadReturnValue,
    };
  }

  describe("on init", () => {
    it("should have correct resource type", () => {
      const { subject } = createSubject();
      expect(subject.resourceType).toEqual(ResourceType.Fileset);
    });

    it("should have name", () => {
      const { subject, filesetName } = createSubject();
      expect(subject.name).toEqual(filesetName);
    });

    it("should have file uploader as a dependency", () => {
      const { subject, fileUploaderMock } = createSubject();
      expect((subject as any).fileUploader).toEqual(fileUploaderMock);
    });
  });

  describe("upload files", () => {
    it("should call file uploader with list of files", () => {
      const { subject, fileUploaderMock } = createSubject();
      const files = mockFilesList(
        faker.random.number(5),
      );
      subject.upload(files);
      expect(fileUploaderMock.upload).toHaveBeenCalledWith(files);
    });

    it("should return file uploader observable", () => {
      const { subject, fileUploadReturnValue } = createSubject();
      expect(subject.upload(mockFilesList())).toEqual(fileUploadReturnValue);
    });

    it("should not subscribe to the upload events", () => {
      const { subject } = createSubject();
      spyOn(subject as any, "getFileUpdates");
      subject.upload(mockFilesList());
      expect((subject as any).getFileUpdates).not.toHaveBeenCalled();
    });

    describe("if auto subscription to upload status is off", () => {
      it("should subscribe to upload events", () => {
        const { subject, fileUploadReturnValue } = createSubject({
          fsConfig: { uploadWaitForCompleted: true, uploadTimeout: 0 },
        });
        const filesLength = faker.random.number(5);
        spyOn(subject as any, "getFileUpdates");
        subject.upload(mockFilesList(filesLength));
        expect((subject as any).getFileUpdates).toHaveBeenCalledWith(
          fileUploadReturnValue,
          filesLength,
        );
      });

      it("should return file statuses observable", () => {
        const { subject } = createSubject({
          fsConfig: { uploadWaitForCompleted: true, uploadTimeout: 0 },
        });
        const watchObservable = of({});
        spyOn(subject as any, "getFileUpdates").and.returnValue(watchObservable);
        expect(subject.upload(mockFilesList())).toEqual(watchObservable);
      });
    });
  });

  describe("subscription to the file uploading events", () => {
    describe("for one file", () => {
      let fileRecord: FilesetInterface<{}>;
      let createdEvent: RealTimeEventMessage;
      let updatedEvent: RealTimeEventMessage;
      let watchSubject: Subject<RealTimeEventMessage>;
      let uploadSubject: Subject<FilesetInterface<{}>>;
      let subject: any;

      beforeEach(() => {
        fileRecord = mockFileRecord(IFileStatus.IN_PROGRESS);
        createdEvent = mockFileEvent(fileRecord.id, "created");
        updatedEvent = mockFileEvent(fileRecord.id, "updated");
        watchSubject = new Subject();
        uploadSubject = new Subject();
        ({ subject } = createSubject({
          fileUploadReturnValue: uploadSubject,
        }));
        subject.watch = jest.fn(() => watchSubject);
      });

      it("should handle flow: [uploaded] -> [created event] -> [updated event]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, 1).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        uploadSubject.next(fileRecord);
        uploadSubject.complete();
        watchSubject.next(createdEvent);
        watchSubject.next(updatedEvent);
      });

      it("should handle flow: [created event] -> [uploaded] -> [updated event]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, 1).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        uploadSubject.next(fileRecord);
        uploadSubject.complete();
        watchSubject.next(createdEvent);
        watchSubject.next(updatedEvent);
      });

      it("should handle flow: [created event] -> [updated event] -> [uploaded]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, 1).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        uploadSubject.next(fileRecord);
        uploadSubject.complete();
        watchSubject.next(createdEvent);
        watchSubject.next(updatedEvent);
      });
    });

    describe("for several files", () => {
      let fileRecords: Array<FilesetInterface<{}>>;
      let createdEvents: RealTimeEventMessage[];
      let updatedEvents: RealTimeEventMessage[];
      let watchSubject: Subject<RealTimeEventMessage>;
      let uploadSubject: Subject<FilesetInterface<{}>>;
      let subject: any;

      beforeEach(() => {
        const files = faker.random.number({ min: 3, max: 10 });
        fileRecords = new Array(files).fill(null).map(() => mockFileRecord(IFileStatus.IN_PROGRESS));
        createdEvents = fileRecords.map((file) => mockFileEvent(file.id, "created"));
        updatedEvents = fileRecords.map((file) => mockFileEvent(file.id, "updated"));
        watchSubject = new Subject();
        uploadSubject = new Subject();
        ({ subject } = createSubject({
          fileUploadReturnValue: uploadSubject,
        }));
        subject.watch = jest.fn(() => watchSubject);
      });

      it("should handle flow: [all uploaded events] -> [all created events] -> [all updated events]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, fileRecords.length).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        fileRecords.forEach((fileRecord) => uploadSubject.next(fileRecord));
        createdEvents.forEach((createdEvent) => watchSubject.next(createdEvent));
        updatedEvents.forEach((updatedEvent) => watchSubject.next(updatedEvent));
        uploadSubject.complete();
      });

      it("should handle flow: [all created events] -> [all uploaded events] -> [all updated events]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, fileRecords.length).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        createdEvents.forEach((createdEvent) => watchSubject.next(createdEvent));
        fileRecords.forEach((fileRecord) => uploadSubject.next(fileRecord));
        updatedEvents.forEach((updatedEvent) => watchSubject.next(updatedEvent));
        uploadSubject.complete();
      });

      it("should handle flow: [all created events] -> [all updated events] -> [all uploaded events]", (done) => {
        (subject as any).getFileUpdates(uploadSubject, fileRecords.length).subscribe(
          (result: any) => expect(result.status).toEqual(IFileStatus.COMPLETED),
          done,
          done,
        );
        createdEvents.forEach((createdEvent) => watchSubject.next(createdEvent));
        updatedEvents.forEach((updatedEvent) => watchSubject.next(updatedEvent));
        fileRecords.forEach((fileRecord) => uploadSubject.next(fileRecord));
        uploadSubject.complete();
      });
    });
  });

  describe("CRUD operations", () => {
    it("should be able start a select query", () => {
      const { subject } = createSubject();
      expect(subject.select() instanceof SelectQuery).toBeTruthy();
    });

    it("should be able start a update query", () => {
      const { subject } = createSubject();
      expect(subject.update({}) instanceof UpdateQuery).toBeTruthy();
    });

    it("should throw an error if try to run insert query", () => {
      const { subject } = createSubject();
      expect(() => subject.insert()).toThrow();
    });

    it("should be able start a delete query", () => {
      const { subject } = createSubject();
      expect(subject.delete() instanceof DeleteQuery).toBeTruthy();
    });
  });
});
