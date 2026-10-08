import { useProtect } from '@/common';

export const useInviteMembersModalGuardModel = () => ({
  allowed: useProtect({ permission: 'org:sys_memberships:manage' }),
});
