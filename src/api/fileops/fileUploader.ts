import { Inject, Injectable } from 'injection-js';
import { merge, Observable } from 'rxjs';
import { API } from '../../config';
import { RequestAdapter } from '../../internal/requestAdapter';
import { AuthOptions, IAuthOptions, TokenManager } from '../core/tokenManager';
import { FilesetMultipart, FilesetName, IFormData } from './fileops.interfaces';

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
   * @param files {Array<FilesetMultipart<T, F>>}
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<T> {
    return merge(
      ...files.map((file) => this.uploadFile(file)),
    );
  }

  /**
   * Upload one record to the fileset
   * @param record {FilesetMultipart<T, F>}
   */
  private uploadFile(record: FilesetMultipart<T, F>): Observable<T> {

    // TODO Append field values here
    this.formData.append('data', '{}');

    if (record.file) {
      this.formData.append('file', record.file);
    }

    return new Observable((observer) => {
      this.tokenManager
        .token(this.config.auth)
        .then((token) => this.execute(token))
        .then((res: T[]) => {
          observer.next(res[0]);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  /**
   * Execute REST request
   * @param token {string} Auth token
   */
  private execute(token: string): Promise<T[]> {

    const headers = {
      Authorization: `${token}`,
    };

    /* this method is available only under NodeJs */
    if (this.formData.getHeaders) {
      Object.assign(headers, this.formData.getHeaders());
    }

    return this.requestAdapter.upload<T[]>(this.getUrl(), headers, this.formData);
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
