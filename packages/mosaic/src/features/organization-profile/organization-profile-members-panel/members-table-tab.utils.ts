import type { OrganizationProfileMember } from './members-table-tab.types';

export const canManageMember = (member: OrganizationProfileMember) => !member.isCurrentUser && !member.isDeprovisioned;
