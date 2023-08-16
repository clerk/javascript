import type { useCoreOrganizationList } from '../../contexts';

export const organizationListParams = {
  userInvitations: {
    infinite: true,
  },
  userSuggestions: {
    infinite: true,
    status: ['pending', 'accepted'],
  },
} satisfies Parameters<typeof useCoreOrganizationList>[0];
