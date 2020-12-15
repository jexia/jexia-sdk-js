import { Inject, Injectable } from "injection-js";
import { merge, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { API, getApiUrl } from "../../config";
import { RequestAdapter } from "../../internal/requestAdapter";
import { AuthOptions, IAuthOptions, TokenManager } from "../core/tokenManager";
import { FilesetInterface, FilesetMultipart, FilesetName, IFormData } from "./fileops.interfaces";

@Injectable()
export class FileUploader<FormDataType extends IFormData<F>, T, F> {

  private formData: FormDataType;

  constructor(
    @Inject(AuthOptions) private config: IAuthOptions,
    @Inject(FilesetName) private filesetName: string,
    private tokenManager: TokenManager,
    private requestAdapter: RequestAdapter,
  ) {}

  /**
   * @internal
   * @param formData
   */
  public provideFormData(formData: FormDataType) {
    // @ts-ignore reset form data
    this.formData = this.resetFormData(formData);
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

    const formData = this.resetFormData();

    formData.append("data", record.data ? JSON.stringify(record.data) : "{}");

    if (record.file) {
      formData.append("file", record.file);
    }

    return this.tokenManager.token(this.config.auth).pipe(
      switchMap((token) => this.execute(token, formData)),
      map(([uploaded]: Array<FilesetInterface<T>>) => uploaded),
    );
  }

  /**
   * Execute REST request
   * @param token Auth token
   * @param formData FormData
   */
  private execute(token: string, formData: FormDataType): Observable<Array<FilesetInterface<T>>> {

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    /* this method is available only under NodeJs */
    if (formData.getHeaders) {
      Object.assign(headers, formData.getHeaders());
    }

    return this.requestAdapter.upload<Array<FilesetInterface<T>>>(this.getUrl(), headers, formData);
  }

  /**
   * Provide fileset URL
   */
  private getUrl() {
    return [
      getApiUrl(this.config),
      API.FILES.ENDPOINT,
      this.filesetName,
    ].join("/");
  }

  /**
   * @internal
   * @param formData
   */
  private resetFormData(formData: FormDataType = this.formData): FormDataType {
    // @ts-ignore
    return new formData.constructor();
  }
}
