/**
 * Checks and assumes a string is an organization ID if it starts with 'org_', specifically for
 * disambiguating with slugs. `_` is a disallowed character in slug names, so slugs cannot
 * start with `org_`.
 */
export function isOrganizationId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith('org_');
}
