/**
 * Resource types
 */
export enum ResourceType {
  Dataset = "ds",
  Fileset = "fs",
  Channel = "channel",
}

/**
 * Basic information from dataset resources
 */
export interface IResource {
  /**
   * Name of the resource
   */
  name: string;
  /**
   * Resource type (for the RTC commands)
   */
  resourceType: ResourceType;
}

/**
 * Default fields that will always exist for any resource
 */
export type DefaultResourceFields = "id" | "created_at" | "updated_at";

/**
 * Default resource interface type
 */
export type DefaultResourceInterface = {
  [P in DefaultResourceFields]: string;
};

/**
 * Extend user provided interface (T) with default resource fields
 */
export type ResourceInterface<T> = T & DefaultResourceInterface;

/**
 * An array of either ids or resources
 */
export type IdentityCollection<T> = string[] | Array<ResourceInterface<T>>;

/**
 * Extract interface from the related resource either its array or a single type
 * and expand it with the default resource fields
 */
export type FromRelated<T> = T extends any[] ? keyof ResourceInterface<T[number]> : keyof ResourceInterface<T>;
