import { InjectionToken } from "injection-js";

export const FilesetName = new InjectionToken<string>('FilesetName');

export interface IFormData<F> {
  append: (name: string, value: string | F, filename?: string) => void;
  getHeaders?: () => { [key: string]: string };
}

/**
 * Fields that each fileset has
 */
export type DefaultFilesetFields = 'id' | 'size' | 'name' | 'created_at' | 'updated_at';

/**
 * File upload statuses
 */
export enum IFileStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Fileset interface type
 */
export type DefaultFilesetInterface = {
  [P in DefaultFilesetFields]: string;
} & {
  status: IFileStatus;
};

/**
 * Extend user provided interface (T) with default fileset fields
 */
export type FilesetInterface<T> = T & DefaultFilesetInterface;

/**
 * Represent one file for upload, file buffer alongside with user-defined fields
 */
export type FilesetMultipart<T, F> = {
  data?: FilesetInterface<T>;
  file?: F;
};
