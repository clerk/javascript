/**
 * Symbol used to identify resource types for event routing.
 * Replaces instanceof checks in State class.
 */
export const RESOURCE_TYPE = Symbol('clerk:resourceType');

export interface SignalBackedResource {
  [RESOURCE_TYPE]: string;
}
