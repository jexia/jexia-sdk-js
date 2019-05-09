import { Inject, Injectable } from "injection-js";
import { Observable } from 'rxjs';
import { IResource } from '../core/resource';
import { FilesetName, IFormData } from '../fileops/fileops.interfaces';
import { FileUploader } from '../fileops/fileUploader';
import { FilesetMultipart, IFileUploadStatus } from './fileops.interfaces';

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

  constructor(
    @Inject(FilesetName) private filesetName: string,
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
   * @param files {Array<FilesetMultipart<T, F>>} list of files with record data
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<IFileUploadStatus> {
    return this.fileUploader.upload(files);
  }

  /** TODO API to develop (make these APIs shared with dataset)
   *
   * public select(): SelectQuery<D> {}
   * public update(data: T): UpdateQuery<T> {}
   * public delete(): DeleteQuery<D> {}
   */
}
