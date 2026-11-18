import { useSecurityPanelController } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/organization-profile-security-panel.controller';
import { OrganizationProfileSecurityPanelView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/organization-profile-security-panel.view';
import { useSSOBypassPageController } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.controller';
import { SSOBypassCard } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.dialog';
import type { SSOBypassModel } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.model';
import {
  SSOBypassPageSkeleton,
  SSOBypassSectionSkeleton,
} from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.skeleton';
import type { SSOBypassEntry } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.types';
import { SSOBypassPageView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass.view';
import { SSOBypassSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-bypass-section.view';
import { save } from '@clerk/mosaic/utils/errors';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosName, chaosRows } from '@/lib/chaos';

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

const roles = [
  { key: 'org:admin', name: 'Admin' },
  { key: 'org:member', name: 'Member' },
];

export function useSSOBypassFixture({
  initialUserIds = ['user_alice', 'user_bob'],
  isLoading = false,
  isError = false,
}: {
  initialUserIds?: string[];
  isLoading?: boolean;
  isError?: boolean;
} = {}): SSOBypassModel {
  const members = useChaosFixture(exampleMembers, items =>
    chaosRows(
      items.map(member => ({ ...member, id: member.userId })),
      24,
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

function SSOBypassPageExample({ model }: { model: SSOBypassModel }) {
  const controller = useSSOBypassPageController(model);
  return model.isLoading ? <SSOBypassPageSkeleton /> : <SSOBypassPageView {...controller} />;
}

export function SecurityPanelExample({
  isLoading = false,
  sectionError = false,
  ...fixture
}: Parameters<typeof useSSOBypassFixture>[0] & { sectionError?: boolean } = {}) {
  const bypass = useSSOBypassFixture(fixture);
  const ssoBypass = { count: bypass.entries.length, isLoading: false, isError: sectionError };
  const controller = useSecurityPanelController({ isLoading, ssoBypass });

  return (
    <OrganizationProfileSecurityPanelView
      {...controller}
      overview={
        isLoading ? (
          <SSOBypassSectionSkeleton />
        ) : controller.onManageSSOBypass ? (
          <SSOBypassSectionView
            count={ssoBypass.count}
            isError={sectionError}
            onManage={controller.onManageSSOBypass}
            manageRef={controller.manageSSOBypassRef}
          />
        ) : null
      }
      ssoBypass={<SSOBypassPageExample model={bypass} />}
    />
  );
}

export function SSOBypassAllowlistExample(props: Parameters<typeof useSSOBypassFixture>[0] = {}) {
  const model = useSSOBypassFixture(props);
  return (
    <SSOBypassCard>
      <SSOBypassPageExample model={model} />
    </SSOBypassCard>
  );
}
