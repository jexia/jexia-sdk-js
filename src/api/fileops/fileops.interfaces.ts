import { InjectionToken } from "injection-js";

export const FilesetName = new InjectionToken<string>('FilesetName');

/**
 * Fields that each fileset has
 */
export type DefaultFilesetFields = 'id' | 'size' | 'name' | 'created_at' | 'updated_at';

/**
 * Fileset interface type
 */
export type DefaultFilesetInterface = {
  [P in DefaultFilesetFields]: string;
};

/**
 * Extend user provided interface (T) with default fileset fields
 */
export type FilesetInterface<T> = T & DefaultFilesetInterface;

/**
 * Represent one file for upload, file buffer alongside with user-defined fields
 */
export type FilesetMultipart<T, F> = {
  record: FilesetInterface<T>;
  file: F;
};

export type IFileStatus = 'loading' | 'loaded' | 'error';

export interface IFileUploadStatus {
  id: string;
  status: IFileStatus;
  message?: string;
}