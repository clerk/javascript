import type { LoadedClerk, OrganizationMembershipResource } from './types';

/**
 * Finds the organization membership for a given organization ID from a list of memberships
 *
 * @param organizationMemberships - Array of organization memberships to search through
 * @param organizationId - ID of the organization to find the membership for
 * @returns The matching organization membership or undefined if not found
 */
export function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  organizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === organizationId,
  );
}

/**
 * Wraps a hook function in a check to see if organization settings is enabled
 *
 * If not enabled, it will open a dialog with a prompt to enable organizations
 *
 * @internal
 */
export const withOrganizationSettingsEnabled =
  <TParams extends any[], TReturn>(
    hook: (...args: TParams) => TReturn,
    getLoadedClerk: () => LoadedClerk | null | undefined,
    callerName?: string,
  ) =>
  (...args: TParams): TReturn => {
    const clerk = getLoadedClerk();
    // @ts-expect-error - __unstable__environment is not typed
    const environment = clerk?.__unstable__environment;

    if (!environment?.organizationSettings.enabled) {
      clerk?.__internal_openEnableOrganizationsPrompt({
        callerName,
      });
    }

    return hook(...args);
  };
