import { Inject, Injectable } from 'injection-js';
import { merge, Observable } from 'rxjs';
import { API } from '../../config';
import { RequestAdapter } from '../../internal/requestAdapter';
import { AuthOptions, IAuthOptions, TokenManager } from '../core/tokenManager';
import { FilesetInterface, FilesetMultipart, FilesetName, IFormData } from './fileops.interfaces';

@Injectable()
export class FileUploader<FormDataType extends IFormData<F>, T, F> {

  private formData: FormDataType;

  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(FilesetName) private filesetName: string,
    private tokenManager: TokenManager,
    private requestAdapter: RequestAdapter,
  ) {}

  public provideFormData(formData: FormDataType) {
    // @ts-ignore reset form data
    this.formData = new formData.constructor();
  }

  /**
   * Upload an array of files by splitting it to the separate streams
   * @param files Files to be uploaded
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<FilesetInterface<T>> {
    return merge(
      ...files.map((file) => this.uploadFile(file)),
    );
  }

  /**
   * Upload one record to the fileset
   * @param record One file to be uploaded
   */
  private uploadFile(record: FilesetMultipart<T, F>): Observable<FilesetInterface<T>> {

    this.formData.append('data', record.data ? JSON.stringify(record.data) : '{}');

    if (record.file) {
      this.formData.append('file', record.file);
    }

    return new Observable((observer) => {
      this.tokenManager
        .token(this.config.auth)
        .then((token) => this.execute(token))
        .then((res: Array<FilesetInterface<T>>) => {
          observer.next(res[0]);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Execute REST request
   * @param token Auth token
   */
  private execute(token: string): Promise<Array<FilesetInterface<T>>> {

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    /* this method is available only under NodeJs */
    if (this.formData.getHeaders) {
      Object.assign(headers, this.formData.getHeaders());
    }

    return this.requestAdapter.upload<Array<FilesetInterface<T>>>(this.getUrl(), headers, this.formData);
  };

  /**
   * Provide fileset URL
   */
  private getUrl() {
    return [
      `${API.PROTOCOL}://${this.config.projectID}.${API.HOST}.${API.DOMAIN}:${API.PORT}`,
      API.FILES.ENDPOINT,
      this.filesetName,
    ].join('/');
  }
}
