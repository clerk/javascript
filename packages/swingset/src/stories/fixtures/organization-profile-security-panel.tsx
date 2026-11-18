import { OrganizationProfileSecurityPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/organization-profile-security-panel.view';
import { useSSOBypassSectionController } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.controller';
import type { SSOBypassModel } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.model';
import { SSOBypassSectionSkeleton } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.skeleton';
import type { SSOBypassEntry } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.types';
import { SSOBypassSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.view';
import { save } from '@clerk/mosaic/utils/errors';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosName, chaosRows } from '@/lib/chaos';

import type { useSSOConnectionsFixture } from './organization-profile-security-sso';
import { SSOSectionExample } from './organization-profile-security-sso';

interface FixtureMember extends SSOBypassEntry {
  role: 'org:admin' | 'org:member';
  outsideConnection?: boolean;
}

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 600));

const exampleMembers: FixtureMember[] = [
  {
    userId: 'user_alice',
    name: 'Alice Chen',
    identifier: 'alice@acme.com',
    username: 'alice',
    imageUrl: undefined,
    isCurrentUser: true,
    role: 'org:admin',
  },
  {
    userId: 'user_bob',
    name: 'Bob Martinez',
    identifier: 'bob@acme.com',
    username: undefined,
    imageUrl: undefined,
    isCurrentUser: false,
    role: 'org:member',
  },
  {
    userId: 'user_carol',
    name: 'Carol Okafor',
    identifier: 'carol@acme.com',
    username: undefined,
    imageUrl: undefined,
    isCurrentUser: false,
    role: 'org:member',
  },
  {
    userId: 'user_dave',
    name: 'Dave Kim',
    identifier: 'dave@contractor.io',
    username: undefined,
    imageUrl: undefined,
    isCurrentUser: false,
    role: 'org:member',
    outsideConnection: true,
  },
];

const sampleNames = [
  'Ana Souza',
  'Ben Carter',
  'Chloe Dubois',
  'Daniel Novak',
  'Elena Petrova',
  'Farah Haddad',
  'George Lin',
  'Hana Sato',
  'Ibrahim Yusuf',
  'Julia Romano',
  'Kofi Mensah',
  'Laura Schmidt',
  'Mateo Garcia',
  'Nina Kowalski',
  'Omar Farouk',
  'Paula Jensen',
  'Quentin Moreau',
  'Rosa Alvarez',
  'Sven Larsen',
  'Tara Singh',
  'Umar Khan',
  'Vera Ivanova',
  'William Osei',
  'Xin Zhao',
  'Yara Nasser',
  'Zoe Bennett',
  'Aiden Walsh',
  'Bianca Rossi',
  'Caleb Brooks',
  'Diana Popescu',
  'Ethan Park',
  'Fatima Zahra',
  'Gabriel Silva',
  'Helena Berg',
];

const sampleMembers: FixtureMember[] = sampleNames.map((name, index) => ({
  userId: `user_sample_${index + 1}`,
  name,
  identifier: `${name.toLowerCase().replace(' ', '.')}@acme.com`,
  username: undefined,
  imageUrl: undefined,
  isCurrentUser: false,
  role: index % 5 === 0 ? 'org:admin' : 'org:member',
}));

const allMembers = [...exampleMembers, ...sampleMembers];

const defaultAllowlist = allMembers
  .filter(member => member.userId !== 'user_carol' && member.userId !== 'user_dave')
  .map(member => member.userId);

const roles = [
  { key: 'org:admin', name: 'Admin' },
  { key: 'org:member', name: 'Member' },
];

export function useSSOBypassFixture({
  initialUserIds = defaultAllowlist,
  isLoading = false,
  isError = false,
  removeFails = false,
}: {
  initialUserIds?: string[];
  isLoading?: boolean;
  isError?: boolean;
  removeFails?: boolean;
} = {}): SSOBypassModel {
  const members = useChaosFixture(allMembers, items =>
    chaosRows(
      items.map(member => ({ ...member, id: member.userId })),
      items.length,
    ).map(({ id, ...member }, index) => ({
      ...member,
      userId: id,
      name: chaosName(index),
      identifier: chaosEmail(index),
    })),
  );
  const [userIds, setUserIds] = useState(() =>
    members
      .filter(member => initialUserIds.some(id => member.userId === id || member.userId.startsWith(`${id}-chaos-`)))
      .map(member => member.userId),
  );
  const entries = members.filter(member => userIds.includes(member.userId));

  return {
    entries,
    isLoading,
    isFetching: false,
    isError,
    isFeatureDisabled: false,
    roles: {
      roles: roles.map(role => ({
        ...role,
        memberCount: members.filter(member => member.role === role.key).length,
      })),
      isLoading: false,
      isError: false,
    },
    retry: () => undefined,
    remove: async userId => {
      await delay();
      if (removeFails) {
        throw new ClerkRuntimeError('Could not remove this member from the allow list.', {
          code: 'sso_bypass_remove_failed',
        });
      }
      setUserIds(current => current.filter(id => id !== userId));
    },
    addByEmail: async email => {
      await save(async () => {
        await delay();
        const member = members.find(item => item.identifier.toLowerCase() === email.trim().toLowerCase());
        if (!member) {
          throw new ClerkRuntimeError('No member of this organization has that email address.', {
            code: 'sso_bypass_member_not_found',
          });
        }
        if (userIds.includes(member.userId)) {
          throw new ClerkRuntimeError('This member is already on the allow list.', {
            code: 'sso_bypass_already_added',
          });
        }
        setUserIds(current => [...current, member.userId]);
      }, ['emailAddress']);
      return { mode: 'email', added: 1, skipped: 0, skipReason: 'unknown' };
    },
    addByRole: async role => {
      let result: Awaited<ReturnType<SSOBypassModel['addByRole']>> | undefined;
      await save(async () => {
        await delay();
        const candidates = members.filter(member => member.role === role && !userIds.includes(member.userId));
        if (candidates.length === 0) {
          throw new ClerkRuntimeError('Everyone with that role is already on the allow list.', {
            code: 'sso_bypass_all_already_added',
          });
        }
        const added = candidates.filter(member => !member.outsideConnection);
        if (added.length === 0) {
          throw new ClerkRuntimeError('None of these members could be added.', {
            code: 'sso_bypass_none_added_domain_not_served',
          });
        }
        setUserIds(current => [...current, ...added.map(member => member.userId)]);
        result = {
          mode: 'role',
          added: added.length,
          skipped: candidates.length - added.length,
          skipReason: 'domainNotServed',
        };
      }, ['role']);
      return result ?? { mode: 'role', added: 0, skipped: 0, skipReason: 'unknown' };
    },
  };
}

function SSOBypassSectionExample({ model }: { model: SSOBypassModel }) {
  const controller = useSSOBypassSectionController(model);
  return model.isLoading ? <SSOBypassSectionSkeleton /> : <SSOBypassSectionView {...controller} />;
}

export function SecurityPanelExample({
  isLoading = false,
  sso,
  ...fixture
}: Parameters<typeof useSSOBypassFixture>[0] & { sso?: Parameters<typeof useSSOConnectionsFixture>[0] } = {}) {
  const bypass = useSSOBypassFixture({ isLoading, ...fixture });
  return (
    <OrganizationProfileSecurityPanelView>
      <SSOSectionExample {...sso} />
      <SSOBypassSectionExample model={bypass} />
    </OrganizationProfileSecurityPanelView>
  );
}

export function SSOBypassAllowlistExample(props: Parameters<typeof useSSOBypassFixture>[0] = {}) {
  const model = useSSOBypassFixture(props);
  return <SSOBypassSectionExample model={model} />;
}
