/**
 * Resource types
 */
export enum ResourceType {
  Dataset = "ds",
  Fileset = "fs",
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
