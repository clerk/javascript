import type { ProfileSectionId } from '@clerk/shared/types';

import { ProfileSection } from '@/ui/elements/Section';

import { Button, Col, Flex, Text } from '../../../customizables';
import { Action } from '../../../elements/Action';
import { useActionContext } from '../../../elements/Action/ActionRoot';
import { useRouter } from '../../../router';
import { EnterpriseSetupForm } from './EnterpriseSetupForm';
import { ExternalSignInRow } from './ExternalSignIn';
import { UNMANAGED_USERS_TAB } from './navigation';
import { OutsidePeopleNotice } from './OutsidePeopleBanner';
import { smallSx } from './parts';
import { protoKey, useAccessPrototype } from './prototypeState';

// Prototype-only: not a registered section id, so it only scopes descriptors.
const SECTION_ID = 'organizationEnterprise' as ProfileSectionId;

/*
 * Prototype: the General page's way into a parent account, without
 * waiting for a domain to be verified. Once there is one, this organization
 * only lists the account it belongs to, not the account's other organizations.
 */
export const EnterpriseAccountSection = () => {
  const store = useAccessPrototype();
  const { navigate } = useRouter();
  const hierarchy = store.hierarchy;
  if (!hierarchy && !store.access.canManage) {
    return null;
  }
  const toUnmanagedUsers = () =>
    void navigate('organization-members', { searchParams: new URLSearchParams({ tab: UNMANAGED_USERS_TAB }) });

  return (
    <ProfileSection.Root
      title={protoKey('Parent account')}
      id={SECTION_ID}
    >
      {hierarchy ? (
        <ProfileSection.Item id={SECTION_ID}>
          <Flex
            align='center'
            gap={3}
            sx={{ minWidth: 0 }}
          >
            <Flex
              align='center'
              justify='center'
              sx={t => ({
                width: t.sizes.$8,
                height: t.sizes.$8,
                flexShrink: 0,
                borderRadius: t.radii.$md,
                backgroundColor: t.colors.$neutralAlpha100,
              })}
            >
              <Text variant='subtitle'>{hierarchy.parentName.charAt(0).toUpperCase()}</Text>
            </Flex>
            <Col sx={{ minWidth: 0 }}>
              <Text truncate>{hierarchy.parentName}</Text>
              <Text
                colorScheme='secondary'
                sx={smallSx}
              >
                {hierarchy.role === 'child' && !hierarchy.isParentMember
                  ? 'Parent account. Its sign-in rules apply here.'
                  : 'Parent account'}
              </Text>
            </Col>
          </Flex>
          {hierarchy.role === 'parent' || hierarchy.isParentMember ? (
            <ProfileSection.Button
              id={SECTION_ID}
              onClick={() => {
                if (hierarchy.role === 'child') {
                  store.setScenario('parent');
                }
                toUnmanagedUsers();
              }}
              localizationKey={protoKey('Manage')}
            />
          ) : null}
        </ProfileSection.Item>
      ) : (
        <Action.Root>
          <Action.Closed value='setup'>
            <Col sx={t => ({ gap: t.space.$2, paddingInlineStart: t.space.$1 })}>
              <ExternalSignInRow />
              <OutsidePeopleNotice />
              <Text
                colorScheme='secondary'
                sx={smallSx}
              >
                Lets a central team manage your company’s users and organizations, starting with this one.
              </Text>
              <Action.Trigger value='setup'>
                <Button
                  variant='outline'
                  block={false}
                  sx={{ alignSelf: 'flex-start' }}
                  localizationKey={protoKey('Set up')}
                />
              </Action.Trigger>
            </Col>
          </Action.Closed>
          <Action.Open value='setup'>
            <Action.Card>
              <ActionSetupForm onCreated={toUnmanagedUsers} />
            </Action.Card>
          </Action.Open>
        </Action.Root>
      )}
    </ProfileSection.Root>
  );
};

const ActionSetupForm = ({ onCreated }: { onCreated: () => void }) => {
  const { close } = useActionContext();
  return (
    <EnterpriseSetupForm
      onClose={close}
      onCreated={onCreated}
    />
  );
};
