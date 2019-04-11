import { Inject, Injectable } from 'injection-js';
import { merge, Observable } from 'rxjs';
import { Methods, RequestAdapter } from '../../internal/requestAdapter';
import { AuthOptions, IAuthOptions, TokenManager } from '../core/tokenManager';
import { FilesetMultipart, IFileUploadStatus } from './fileops.interfaces';

@Injectable()
export class FileUploader<T, F> {

  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    private requestAdapter: RequestAdapter,
    private tokenManager: TokenManager,
  ) {}

  /**
   * Upload an array of files by splitting it to the separate streams
   * @param files {Array<FilesetMultipart<T, F>>}
   */
  public upload(files: Array<FilesetMultipart<T, F>>): Observable<IFileUploadStatus> {
    return merge(
      ...files.map((file) => this.uploadFile(file)),
    );
  }

  /**
   * Upload one file to the fileset
   * @param file {FilesetMultipart<T, F>}
   */
  private uploadFile(file: FilesetMultipart<T, F>): Observable<IFileUploadStatus> {
    return new Observable((observer) => {
      // TODO Subscribe to the FS RTC events
      this.tokenManager
        .token(this.config.auth)
        .then((token) => this.execute(token, file))
        .then((status) => {
          switch (status.status) {
            case 'loaded':
              observer.complete();
              break;
            case 'loading':
              observer.next(status);
              break;
            case 'error':
            default:
              observer.error(status.message);
          }
        });
    });
  }

  /**
   * Execute REST request
   * @param token {string} Auth token
   * @param file {FilesetMultipart<T, F>} File data
   */
  private execute(token: string, file: FilesetMultipart<T, F>): Promise<IFileUploadStatus> {
    return this.requestAdapter.execute<IFileUploadStatus>(
      this.getUrl(),
      {
        body: {
          // TODO Convert file to multipart form
          file,
        },
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data',
        },
        method: Methods.POST,
      },
    );
  };

  // TODO Provide correct url
  private getUrl() {
    return '';
  }
}
