import { Inject, Injectable } from "injection-js";
import { Observable } from 'rxjs';
import { IResource } from '../core/resource';
import { FilesetName } from '../fileops/fileops.interfaces';
import { FileUploader } from '../fileops/fileUploader';
import { FilesetMultipart, IFileUploadStatus } from './fileops.interfaces';

/**
 * Fileset object is used for manipulate files
 *
 * @template <T> fileset user fields
 * @template <D> user + default fields
 * @template <F> file type (ArrayBuffer for web, Buffer for node)
 */
@Injectable()
export class Fileset<T, D, F> implements IResource {

  constructor(
    @Inject(FilesetName) private filesetName: string,
    private fileUploader: FileUploader<T, F>,
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
   * @param files {Array<FilesetMultipart<T, F>>} list of files with record data
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<IFileUploadStatus> {
    return this.fileUploader.upload(files);
  }

  /** TODO API to develop
   *
   * public select(): SelectQuery<D> {}
   * public update(data: T): UpdateQuery<T> {}
   * public delete(): DeleteQuery<D> {}
   */
}
