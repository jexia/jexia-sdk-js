import { Inject, Injectable } from "injection-js";
import { Observable, Subject, Subscriber } from "rxjs";
import { concatMap, filter, map, shareReplay, takeUntil, tap } from "rxjs/operators";
import { RequestExecuter } from "../../internal/executer";
import { QueryActionType } from "../../internal/utils";
import { ClientConfiguration } from "../core/client";
import { ActionQuery } from "../core/queries/actionQuery";
import { DeleteQuery } from "../core/queries/deleteQuery";
import { SelectQuery } from "../core/queries/selectQuery";
import { UpdateQuery } from "../core/queries/updateQuery";
import { IResource, ResourceType } from "../core/resource";
import { IFilteringCriterion, IFilteringCriterionCallback } from "../dataops/filteringApi";
import {
  FileOperationsConfig,
  FilesetInterface,
  FilesetName,
  IFileStatus,
  IFormData
} from "../fileops/fileops.interfaces";
import { FileUploader } from "../fileops/fileUploader";
import { FilesetMultipart } from "./fileops.interfaces";

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
    private requestExecuter: RequestExecuter,
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

    if (this.clientConfig.fileOperations.uploadWaitForCompleted) {
      return this.getFileUpdates(fileUploadObservable, files.length);
    }

    return fileUploadObservable;
  }

  /**
   * Creates a Select query.
   * @returns Query object specialized for select statements.
   * With no filters set, returns all records in the selected dataset.
   */
  public select(): SelectQuery<D> {
    return new SelectQuery<D>(this.requestExecuter, ResourceType.Fileset, this.filesetName);
  }

  /**
   * Creates an Update query.
   * @param data Dictionary that contains the key:value pairs for the fields that you want to modify of this dataset
   * @returns Query object specialized for update statements.
   * Don't forget to apply a filter to specify the fields that will be modified.
   * TODO update() does not work as in datasets
   */
  public update(data: T): UpdateQuery<T> {
    return new UpdateQuery<T>(this.requestExecuter, data, ResourceType.Fileset, this.filesetName);
  }

  /**
   * insert() does not implemented
   */
  public insert(): never {
    throw new Error("Fileset does not have INSERT, please use upload() instead");
  }

  /**
   * Creates a Delete query
   * @returns Query object specialized for delete statements
   * You need to specify a filter to narrow down the records that you want deleted
   * from the backend.
   */
  public delete(): DeleteQuery<FilesetInterface<T>> {
    return new DeleteQuery(this.requestExecuter, ResourceType.Fileset, this.filesetName);
  }

  /**
   * Creates an Attach query.
   * @param   resourceName The name of the resource to be attached.
   * @param   filter Filtering criterion or a callback that returns one,
   * that will be applied to the resource to be attached.
   * @returns ActionQuery object specialized for attaching resources to the current one.
   */
  public attach(
    resourceName: string,
    filter?: IFilteringCriterion<T> | IFilteringCriterionCallback<T>,
  ): ActionQuery<T> {
    return new ActionQuery(
      this.requestExecuter,
      ResourceType.Fileset,
      this.filesetName,
      resourceName,
      QueryActionType.ATTACH,
      filter,
    );
  }

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
    const watcher = this.watch().pipe(
      takeUntil(allFilesCompleted),
      filter((event) => event.action === "updated"),
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
          allFilesCompleted.next();
          allFilesCompleted.complete();
        }
      })
    );

    /* Subscribe to watcher before starting to upload files in order to not
       miss any events
     */
    return Observable.create((subscriber: Subscriber<FilesetInterface<T>>) => {
      const watcherSubscription = watcher.subscribe(subscriber);
      sharedUploadingProcess.subscribe();
      return () => watcherSubscription.unsubscribe();
    });
  }
}
