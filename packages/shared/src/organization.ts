import type { Clerk, OrganizationMembershipResource } from './types';

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
 * Options for the withOrganizationsEnabled HOC
 */
export interface WithOrganizationsEnabledOptions {
  /**
   * Function to call when organizations are disabled.
   * Default behavior opens a modal to prompt enabling organizations.
   */
  onDisabled?: (clerk: Clerk) => void;
  /**
   * Whether to throw an error instead of calling onDisabled when organizations are disabled.
   * Defaults to false.
   */
  throwError?: boolean;
}

/**
 * Higher-order function that adds a guard for organization features.
 * Opens a dialog for development mode, in order to enable organizations on the instance.
 *
 * @internal
 *
 * @example
 * // React
 * import { useClerk } from '@clerk/shared/react';
 * import { withOrganizationsEnabled } from '@clerk/shared/organization';
 *
 * export const useOrganization = withOrganizationsEnabled(() => useClerk(), {
 *   onDisabled: (clerk) => clerk.openOrganizationProfile(),
 * })(() => {
 *   const clerk = useClerk();
 *   // ... implementation
 * });
 */
export function withOrganizationsEnabled<T extends (...args: any[]) => any>(getClerk: () => Clerk) {
  return (func: T): T => {
    return ((...args: Parameters<T>) => {
      const clerk = getClerk();

      if (!clerk.loaded) {
        // If Clerk is not loaded yet, return early or return undefined based on return type
        return func(...args);
      }

      // @ts-expect-error `__unstable__environment` is not fully typed in Clerk interface
      const environment = clerk.__unstable__environment;
      const organizationsEnabled = environment?.organizationSettings?.enabled ?? false;

      if (!organizationsEnabled) {
        alert('hey');

        // Return early - don't execute the function if organizations are disabled
        // Return undefined or null based on expected return type
        return undefined as ReturnType<T>;
      }

      return func(...args);
    }) as T;
  };
}
