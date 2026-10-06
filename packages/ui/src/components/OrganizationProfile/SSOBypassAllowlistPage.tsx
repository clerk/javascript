import { __internal_useOrganizationSSOBypassAllowlist, useOrganization, useUser } from '@clerk/shared/react';
import type {
  AddSSOBypassAllowlistUserParams,
  AddSSOBypassAllowlistUsersParams,
  OrganizationCustomRoleKey,
  OrganizationResource,
  SSOBypassAllowlistBulkCreateResult,
  SSOBypassAllowlistUserResource,
} from '@clerk/shared/types';
import React, { useCallback, useMemo, useState } from 'react';

import { ExclamationTriangle, InformationCircle, UserPlus } from '@/icons';
import { Action } from '@/ui/elements/Action';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { Alert } from '@/ui/elements/Alert';
import { Animated } from '@/ui/elements/Animated';
import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { DataTable, DataTableRow } from '@/ui/elements/DataTable';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';
import { IconCircle } from '@/ui/elements/IconCircle';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { SearchInput } from '@/ui/elements/SearchInput';
import { SegmentedControl } from '@/ui/elements/SegmentedControl';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../common';
import type { LocalizationKey } from '../../customizables';
import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  Icon,
  localizationKeys,
  Td,
  Text,
  useLocalizations,
} from '../../customizables';
import { useFetch } from '../../hooks/useFetch';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import { mqu } from '../../styledSystem';
import { RoleSelect } from './MemberListTable';
import { SecurityBackControl } from './SecurityBackControl';

type SSOBypassAllowlistPageProps = {
  onBack: () => void;
};

const MEMBER_LOOKUP_PAGE_SIZE = 10;
const ROLE_MEMBERS_PAGE_SIZE = 100;

type BulkResult = { mode: AddMode; added: number; skipped: number; skippedCode: string | null };
type AddMode = 'email' | 'role';
type FormMessage = LocalizationKey | string;

const DOMAIN_NOT_SERVED = 'sso_bypass_domain_not_served';
const NOT_A_MEMBER = 'resource_not_found';
type RoleOption = { value: string; label: string };

const findMemberByEmail = async (organization: OrganizationResource, email: string) => {
  const wanted = email.toLowerCase();
  let fetched = 0;
  for (let page = 1; ; page++) {
    const { data, total_count } = await organization.getMemberships({
      query: email,
      pageSize: MEMBER_LOOKUP_PAGE_SIZE,
      initialPage: page,
    });
    const match = data.find(membership => membership.publicUserData?.identifier?.toLowerCase() === wanted);
    fetched += data.length;
    if (match || data.length === 0 || fetched >= total_count) {
      return match;
    }
  }
};

const useRoleMemberCounts = (roles: RoleOption[] | undefined, enabled: boolean): Record<string, number> => {
  const { organization } = useOrganization();
  const roleKeys = (roles ?? []).map(role => role.value);

  const fetchCounts = async ({ keys }: { keys: string[] }) => {
    if (!organization) {
      return {};
    }
    const entries = await Promise.all(
      keys.map(async role => {
        const { total_count } = await organization.getMemberships({ role: [role], pageSize: 1 });
        return [role, total_count] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<string, number>;
  };

  const shouldFetch = enabled && Boolean(organization?.id) && roleKeys.length > 0;
  const { data } = useFetch(shouldFetch ? fetchCounts : undefined, {
    keys: roleKeys,
    orgId: organization?.id,
    enabled: shouldFetch,
  });

  return data ?? {};
};

const collectUserIdsByRole = async (organization: OrganizationResource, role: OrganizationCustomRoleKey) => {
  const userIds: string[] = [];
  let fetched = 0;
  for (let page = 1; ; page++) {
    const { data, total_count } = await organization.getMemberships({
      role: [role],
      pageSize: ROLE_MEMBERS_PAGE_SIZE,
      initialPage: page,
    });
    fetched += data.length;
    data.forEach(membership => {
      const userId = membership.publicUserData?.userId;
      if (userId) {
        userIds.push(userId);
      }
    });
    if (data.length === 0 || fetched >= total_count) {
      return userIds;
    }
  }
};

const sharedCode = (codes: string[]): string | null =>
  codes.length > 0 && codes.every(code => code === codes[0]) ? codes[0] : null;

const skippedText = (skipped: number, code: string | null): LocalizationKey => {
  const reason = code === DOMAIN_NOT_SERVED ? 'domainNotServed' : code === NOT_A_MEMBER ? 'notMember' : 'unknown';
  return skipped === 1
    ? localizationKeys(`organizationProfile.securityPage.ssoBypassPage.bulkResult.${reason}__one` as const)
    : localizationKeys(`organizationProfile.securityPage.ssoBypassPage.bulkResult.${reason}` as const, {
        count: String(skipped),
      });
};

const InlineMessage = (props: {
  icon: React.ComponentType;
  text: FormMessage;
  elementDescriptor?: (typeof descriptors)[keyof typeof descriptors];
}): JSX.Element => (
  <Flex
    elementDescriptor={props.elementDescriptor}
    align='center'
    gap={2}
  >
    <Icon
      icon={props.icon}
      size='sm'
      colorScheme='neutral'
      sx={{ flexShrink: 0 }}
    />
    <Text
      as='span'
      colorScheme='secondary'
      variant='caption'
      {...(typeof props.text === 'string' ? { children: props.text } : { localizationKey: props.text })}
    />
  </Flex>
);

const matchesSearch = (entry: SSOBypassAllowlistUserResource, term: string): boolean => {
  const { firstName, lastName, identifier, username } = entry.publicUserData;
  const haystack = [firstName, lastName, identifier, username].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(term);
};

export const SSOBypassAllowlistPage = withCardStateProvider(({ onBack }: SSOBypassAllowlistPageProps): JSX.Element => {
  const card = useCardState();
  const { t } = useLocalizations();
  const { user } = useUser();
  const { data, isLoading, error, addUser, addUsers, removeUser } = __internal_useOrganizationSSOBypassAllowlist();

  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const entries = useMemo(
    () => (term ? (data ?? []).filter(entry => matchesSearch(entry, term)) : (data ?? [])),
    [data, term],
  );
  const allowlistedUserIds = useMemo(() => new Set((data ?? []).map(entry => entry.userId)), [data]);

  const handleRemove = (userId: string) =>
    card.runAsync(() => removeUser(userId)).catch(err => handleError(err, [], card.setError));

  return (
    <ProfileCard.Page>
      <Col
        elementDescriptor={[descriptors.page, descriptors.organizationProfileSecuritySsoBypassPage]}
        sx={t => ({ gap: t.space.$8 })}
      >
        <Col
          elementDescriptor={descriptors.profilePage}
          elementId={descriptors.profilePage.setId('organizationSecurity')}
          gap={4}
        >
          <Col gap={4}>
            <Flex>
              <SecurityBackControl onClick={onBack} />
            </Flex>
            <Header.Root>
              <Header.Title
                localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassPage.title')}
                textVariant='h2'
              />
            </Header.Root>
          </Col>

          <Action.Root animate={false}>
            <Animated asChild>
              <Flex
                justify='between'
                gap={2}
                sx={t => ({ width: '100%', padding: `${t.space.$none} ${t.space.$1}` })}
              >
                <Flex sx={{ width: '50%', [mqu.sm]: { width: 'auto' } }}>
                  <SearchInput
                    value={search}
                    aria-label={t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.action__search'))}
                    placeholder={t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.action__search'))}
                    elementDescriptor={descriptors.organizationProfileSecuritySsoBypassSearchInput}
                    leftIconElementDescriptor={descriptors.organizationProfileSecuritySsoBypassSearchInputIcon}
                    onChange={e => setSearch(e.target.value)}
                    onClear={() => setSearch('')}
                  />
                </Flex>

                <Action.Trigger
                  value='add'
                  hideOnActive={false}
                >
                  <Button
                    elementDescriptor={descriptors.organizationProfileSecuritySsoBypassAddButton}
                    localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassPage.action__add')}
                  />
                </Action.Trigger>
              </Flex>
            </Animated>

            <Action.Open value='add'>
              <Flex sx={t => ({ padding: `${t.space.$none} ${t.space.$1} ${t.space.$6} ${t.space.$1}` })}>
                <Action.Card sx={{ width: '100%' }}>
                  <AddMemberScreen
                    allowlistedUserIds={allowlistedUserIds}
                    addUser={addUser}
                    addUsers={addUsers}
                  />
                </Action.Card>
              </Flex>
            </Action.Open>
          </Action.Root>

          <Card.Alert>{card.error}</Card.Alert>

          {error ? (
            <Alert
              variant='danger'
              title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.error__load')}
              subtitle={error.message}
            />
          ) : (
            <DataTable
              page={1}
              onPageChange={() => {}}
              itemCount={entries.length}
              pageCount={1}
              itemsPerPage={Math.max(entries.length, 1)}
              isLoading={isLoading}
              emptyStateLocalizationKey={
                term
                  ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.table.emptyState__search')
                  : localizationKeys('organizationProfile.securityPage.ssoBypassPage.table.emptyState')
              }
              headers={[
                { key: localizationKeys('organizationProfile.securityPage.ssoBypassPage.table.header__user') },
                {
                  key: localizationKeys('organizationProfile.securityPage.ssoBypassPage.table.header__actions'),
                  align: 'right',
                },
              ]}
              rows={entries.map(entry => (
                <AllowlistRow
                  key={entry.userId}
                  entry={entry}
                  isCurrentUser={user?.id === entry.userId}
                  onRemove={() => void handleRemove(entry.userId)}
                />
              ))}
            />
          )}
        </Col>
      </Col>
    </ProfileCard.Page>
  );
});

type AllowlistRowProps = {
  entry: SSOBypassAllowlistUserResource;
  isCurrentUser: boolean;
  onRemove: () => void;
};

const AllowlistRow = ({ entry, isCurrentUser, onRemove }: AllowlistRowProps): JSX.Element => {
  const card = useCardState();

  return (
    <DataTableRow>
      <Td>
        <UserPreview
          sx={{ maxWidth: '30ch' }}
          user={entry.publicUserData}
          subtitle={entry.publicUserData.identifier}
          subtitleProps={{ variant: 'caption' }}
          badge={isCurrentUser ? <Badge localizationKey={localizationKeys('badge__you')} /> : undefined}
        />
      </Td>
      <Td>
        <Flex justify='end'>
          <ThreeDotsMenu
            elementId='ssoBypass'
            actions={[
              {
                label: localizationKeys('organizationProfile.securityPage.ssoBypassPage.table.menuAction__remove'),
                isDestructive: true,
                isDisabled: card.isLoading,
                onClick: onRemove,
              },
            ]}
          />
        </Flex>
      </Td>
    </DataTableRow>
  );
};

type AddMemberProps = {
  allowlistedUserIds: Set<string>;
  addUser: (params: AddSSOBypassAllowlistUserParams) => Promise<unknown>;
  addUsers: (params: AddSSOBypassAllowlistUsersParams) => Promise<SSOBypassAllowlistBulkCreateResult | undefined>;
};

const addedText = (result: BulkResult | null): LocalizationKey => {
  if (result?.mode === 'email') {
    return localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.addedMember');
  }
  return result?.added === 1
    ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added__one')
    : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added', {
        count: String(result?.added ?? 0),
      });
};

const AddMemberScreen = (props: AddMemberProps): JSX.Element => {
  const { close } = useActionContext();
  const wizard = useWizard();
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  return (
    <Wizard {...wizard.props}>
      <AddMemberForm
        {...props}
        onReset={close}
        onResult={result => {
          setBulkResult(result);
          wizard.nextStep();
        }}
      />
      <SuccessPage
        elementDescriptor={descriptors.organizationProfileSecuritySsoBypassBulkResult}
        title={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.title')}
        contents={
          <Col gap={4}>
            <Flex
              direction='col'
              center
              gap={4}
            >
              <IconCircle icon={UserPlus} />
              <Text
                localizationKey={addedText(bulkResult)}
                sx={{ textAlign: 'center' }}
              />
            </Flex>
            {bulkResult && bulkResult.skipped > 0 && (
              <Alert
                variant='warning'
                title={skippedText(bulkResult.skipped, bulkResult.skippedCode)}
              />
            )}
          </Col>
        }
        onFinish={close}
      />
    </Wizard>
  );
};

const AddMemberForm = withCardStateProvider(
  ({
    allowlistedUserIds,
    addUser,
    addUsers,
    onResult,
    onReset,
  }: AddMemberProps & {
    onReset: () => void;
    onResult: (result: BulkResult) => void;
  }): JSX.Element => {
    const card = useCardState();
    const { t, translateError } = useLocalizations();
    const [mode, setMode] = useState<AddMode>('email');
    const [role, setRole] = useState('');
    const [failure, setFailure] = useState<FormMessage | null>(null);
    const { organization } = useOrganization();
    const { options: roles } = useFetchRoles();
    const roleCounts = useRoleMemberCounts(roles, mode === 'role');

    const emailField = useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.emailPlaceholder'),
      isRequired: true,
    });

    const formatRoleLabel = useCallback(
      (label: string, role: RoleOption) => {
        const count = roleCounts[role.value];
        return count === undefined
          ? label
          : t(
              localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.roleOption', {
                role: label,
                count: String(count),
              }),
            );
      },
      [roleCounts, t],
    );

    const email = emailField.value.trim();
    const canSubmit = !card.isLoading && (mode === 'email' ? email !== '' : Boolean(role));

    const changeMode = (next: AddMode) => {
      setFailure(null);
      setMode(next);
    };

    const addByEmail = async (): Promise<BulkResult | undefined> => {
      if (!organization) {
        return;
      }
      const member = await findMemberByEmail(organization, email);
      const userId = member?.publicUserData?.userId;
      if (!userId) {
        setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__memberNotFound'));
        return;
      }
      if (allowlistedUserIds.has(userId)) {
        setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__alreadyAdded'));
        return;
      }
      await addUser({ userId });
      return { mode: 'email' as const, added: 1, skipped: 0, skippedCode: null };
    };

    const addByRole = async (): Promise<BulkResult | undefined> => {
      if (!organization) {
        return;
      }
      const userIds = (await collectUserIdsByRole(organization, role)).filter(
        userId => !allowlistedUserIds.has(userId),
      );
      if (userIds.length === 0) {
        setFailure(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__allAlreadyAdded'));
        return;
      }
      const result = await addUsers({ userIds });
      const added = result?.data.length ?? 0;
      const skipped = result?.errors ?? [];
      const skippedCode = sharedCode(skipped.map(error => error.code));
      if (added === 0) {
        setFailure(skippedText(skipped.length, skippedCode));
        return;
      }
      return { mode: 'role' as const, added, skipped: skipped.length, skippedCode };
    };

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      setFailure(null);

      try {
        const result = await card.runAsync(mode === 'email' ? addByEmail : addByRole);
        if (result) {
          onResult(result);
        }
      } catch (err) {
        handleError(err as Error, [emailField], error => setFailure(translateError(error)));
      }
    };

    return (
      <FormContainer
        gap={4}
        headerTitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.title')}
        headerSubtitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.subtitle')}
      >
        <Form.Root
          gap={4}
          onSubmit={onSubmit}
        >
          <SegmentedControl.Root
            aria-label={t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.modeLabel'))}
            value={mode}
            onChange={next => changeMode(next as AddMode)}
            size='lg'
            sx={{ alignSelf: 'flex-start' }}
          >
            <SegmentedControl.Button
              value='email'
              text={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.mode__email')}
            />
            <SegmentedControl.Button
              value='role'
              text={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.mode__role')}
            />
          </SegmentedControl.Root>

          {mode === 'email' ? (
            <Col gap={2}>
              <Form.ControlRow elementId={emailField.id}>
                <Form.PlainInput
                  {...emailField.props}
                  autoFocus
                  ignorePasswordManager
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassEmailInput}
                />
              </Form.ControlRow>
              {failure && (
                <InlineMessage
                  icon={ExclamationTriangle}
                  text={failure}
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassFailure}
                />
              )}
            </Col>
          ) : (
            <Col gap={2}>
              <RoleSelect
                roles={roles}
                value={role}
                formatLabel={formatRoleLabel}
                onChange={setRole}
                isDisabled={card.isLoading}
                triggerSx={t => ({ width: '100%', justifyContent: 'space-between', color: t.colors.$colorForeground })}
              />
              {failure && (
                <InlineMessage
                  icon={ExclamationTriangle}
                  text={failure}
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassFailure}
                />
              )}
              <InlineMessage
                icon={InformationCircle}
                text={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.roleWarning')}
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassRoleWarning}
              />
            </Col>
          )}

          <FormButtons
            isDisabled={!canSubmit}
            submitLabel={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.submitButton')}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);
