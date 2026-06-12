import { useMutation } from '@tanstack/react-query';

import { membersKey } from './members-query';
import type { MembershipResource, OrganizationResource } from './organization-store';
import { getMosaicQueryClient } from './query-client';

/**
 * Mutations via `useMutation`, calling the resource's own method — `isPending` / `error` /
 * `onSuccess` come for free, replacing the hand-rolled `isDeleting` `useState` + `await` dance and
 * giving cache invalidation a first-class home.
 *
 * The client is passed explicitly (react-query's optional `queryClient` arg) so a section renders
 * standalone — no `QueryClientProvider` needed in the tree (e.g. a per-component story).
 */

/** `organization.destroy()` — an admin deletes the whole org. */
export function useDeleteOrganization(organization: OrganizationResource) {
  return useMutation(
    {
      mutationFn: () => organization.destroy(),
    },
    getMosaicQueryClient(),
  );
}

/** `membership.destroy()` — the current user leaves the org. */
export function useLeaveOrganization(organization: OrganizationResource, membership: MembershipResource) {
  const queryClient = getMosaicQueryClient();

  return useMutation(
    {
      mutationFn: () => membership.destroy(),
      onSuccess: () => {
        // Membership changed — drop the cached members collection so it refetches.
        void queryClient.invalidateQueries({ queryKey: membersKey(organization.id) });
      },
    },
    queryClient,
  );
}
