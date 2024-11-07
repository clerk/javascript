import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/types';
import { computed } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';
import { useSession } from './useSession';

type UseOrganizationReturn =
  | {
      isLoaded: false;
      organization: undefined;
      membership: undefined;
    }
  | {
      isLoaded: true;
      organization: OrganizationResource;
      membership: undefined;
    }
  | {
      isLoaded: boolean;
      organization: OrganizationResource | null;
      membership: OrganizationMembershipResource | null | undefined;
    };

type UseOrganization = () => ToComputedRefs<UseOrganizationReturn>;

/**
 * Returns the current [`Organization`](https://clerk.com/docs/references/javascript/organization/organization) object
 * along with loading states and membership information.
 *
 * @example
 *
 * <script setup>
 * import { useOrganization } from '@clerk/vue'
 *
 * const { isLoaded, organization, membership } = useOrganization()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else-if="organization">
 *     <h1>{{ organization.name }}</h1>
 *     <p>Your role: {{ membership.role }}</p>
 *   </div>
 *
 *   <div v-else>
 *     No active organization
 *   </div>
 * </template>
 */
export const useOrganization: UseOrganization = () => {
  const { clerk, organizationCtx } = useClerkContext();
  const { session } = useSession();

  const result = computed<UseOrganizationReturn>(() => {
    if (organizationCtx.value === undefined) {
      return { isLoaded: false, organization: undefined, membership: undefined };
    }

    if (organizationCtx.value === null) {
      return { isLoaded: true, organization: null, membership: null };
    }

    /** In SSR context we include only the organization object when loadOrg is set to true. */
    if (!clerk.value?.loaded) {
      return {
        isLoaded: true,
        organization: organizationCtx.value,
        membership: undefined,
      };
    }

    return {
      isLoaded: clerk.value.loaded,
      organization: organizationCtx.value,
      membership: getCurrentOrganizationMembership(
        session.value!.user.organizationMemberships,
        organizationCtx.value.id,
      ),
    };
  });

  return toComputedRefs(result);
};

function getCurrentOrganizationMembership(
  organizationMemberships: OrganizationMembershipResource[],
  activeOrganizationId: string,
) {
  return organizationMemberships.find(
    organizationMembership => organizationMembership.organization.id === activeOrganizationId,
  );
}
