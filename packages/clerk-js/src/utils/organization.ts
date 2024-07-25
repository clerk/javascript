/**
 * Checks and assumes a string is an organization ID if it starts with 'org_'.
 */
export function isOrganizationId(id: string) {
  return id.startsWith('org_');
}
