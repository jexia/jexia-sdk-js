import { Inject, Injectable } from "injection-js";
import { Observable, Subject } from 'rxjs';
import { concatMap, filter, map, shareReplay, takeUntil, tap } from "rxjs/operators";
import { ClientConfiguration } from "../core/client";
import { IResource, ResourceType } from '../core/resource';
import {
  FileOperationsConfig,
  FilesetInterface,
  FilesetName,
  IFileStatus,
  IFormData
} from '../fileops/fileops.interfaces';
import { FileUploader } from '../fileops/fileUploader';
import { FilesetMultipart } from './fileops.interfaces';

/**
 * Fileset object is used for manipulating files
 *
 * @template <FormDataType> Type of FormData (different for Node and Browser)
 * @template <T> fileset user fields
 * @template <D> user + default fields
 * @template <F> file type (ArrayBuffer for web, ReadStream for node)
 */
@Injectable()
export class Fileset<FormDataType extends IFormData<F>, T, D, F> implements IResource {
  /**
   * Resource type of the fileset
   */
  public readonly resourceType: ResourceType = ResourceType.Fileset;

  constructor(
    @Inject(FilesetName) private filesetName: string,
    @Inject(ClientConfiguration) private clientConfig: { fileOperations: FileOperationsConfig },
    private fileUploader: FileUploader<FormDataType, T, F>,
  ) {}

  /**
   * Name of the fileset
   * @returns name {string}
   */
  public get name(): string {
    return this.filesetName;
  }

  /**
   * Upload files and create records in the fileset
   * @param files list of files with record data
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<FilesetInterface<T>> {

    let fileUploadObservable = this.fileUploader.upload(files);

    if (this.clientConfig.fileOperations.subscribeForTheFileUploading) {
      return this.getFileUpdates(fileUploadObservable, files.length);
    }

    return fileUploadObservable;
  }

  /** TODO API to develop (make these APIs shared with dataset)
   *
   * public select(): SelectQuery<D> {}
   * public update(data: T): UpdateQuery<T> {}
   * public delete(): DeleteQuery<D> {}
   */

  /**
   * Subscribe for the RTC records
   * update file record with a status
   * @param uploadingProcess Observable of the uploading files process
   * @param filesUploaded The number of files to be uploaded
   */
  private getFileUpdates(uploadingProcess: Observable<FilesetInterface<T>>, filesUploaded: number):
    Observable<FilesetInterface<T>> {

    let filesCompleted = 0;
    const allFilesCompleted = new Subject();
    const sharedUploadingProcess = uploadingProcess.pipe(
      shareReplay()
    );

    sharedUploadingProcess.subscribe();

    return this.watch().pipe(
      takeUntil(allFilesCompleted),
      filter((event) => event.action === 'updated'),
      /* for each event looking through all uploaded files to find that same, proper file */
      concatMap((event) => sharedUploadingProcess.pipe(
        filter((fileRecord) => fileRecord.id === event.data[0].id),
        map((fileRecord) => {
          /* just make it COMPLETED atm
             TODO Analyze event, it can be failure
          */
          fileRecord.status = IFileStatus.COMPLETED;
          filesCompleted++;
          return fileRecord;
        })
      )),
      tap(() => {
        if (filesCompleted === filesUploaded) {
          allFilesCompleted.complete();
        }
      })
    );
  }
}
