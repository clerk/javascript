import type { MembersRoles } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/members-table-tab.types';
import { useInviteMembersController } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/organization-profile-invite-members.controller';
import type { InviteMembersInput } from '@clerk/mosaic/features/organization-profile/organization-profile-members-panel/organization-profile-invite-members.model';
import { SaveError } from '@clerk/mosaic/utils/errors';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosRole } from '@/lib/chaos';

const exampleRoles: MembersRoles = {
  roles: [
    { key: 'org:member', name: 'Member' },
    { key: 'org:admin', name: 'Admin' },
  ],
  hasRoleSetMigration: false,
};

const existingMembers = ['ada.lovelace@example.com', 'grace.hopper@example.com'];

async function invite({ emailAddresses, onRejected }: InviteMembersInput) {
  await new Promise(resolve => setTimeout(resolve, 800));
  const rejected = emailAddresses.filter(email => existingMembers.includes(email));
  if (rejected.length > 0) {
    onRejected(rejected);
    throw new SaveError({ global: { code: 'already_a_member_in_organization' } });
  }
}

export function useInviteMembersFixture() {
  const roles = useChaosFixture(exampleRoles, value => ({
    ...value,
    roles: value.roles.map((role, index) => ({ ...role, name: chaosRole(index).label })),
  }));
  const { onInvite, inviteDialog } = useInviteMembersController({ roles, defaultRole: 'org:member', invite });
  if (!onInvite || !inviteDialog) {
    throw new Error('The invite members fixture always passes invite and roles.');
  }
  return { onInvite, inviteDialog };
}
