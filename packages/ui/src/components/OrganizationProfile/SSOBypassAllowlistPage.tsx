import { __internal_useOrganizationSSOBypassAllowlist, useOrganization, useUser } from '@clerk/shared/react';
import type {
  AddSSOBypassAllowlistUserParams,
  AddSSOBypassAllowlistUsersParams,
  OrganizationCustomRoleKey,
  OrganizationResource,
  SSOBypassAllowlistBulkCreateResult,
  SSOBypassAllowlistUserResource,
} from '@clerk/shared/types';
import React, { useEffect, useMemo, useState } from 'react';

import { ExclamationTriangle } from '@/icons';
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
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { SearchInput } from '@/ui/elements/SearchInput';
import { SegmentedControl } from '@/ui/elements/SegmentedControl';
import { SuccessPage } from '@/ui/elements/SuccessPage';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

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
import { useWizard, Wizard } from '../../common';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import { mqu } from '../../styledSystem';
import { RoleSelect } from './MemberListTable';
import { SecurityBackControl } from './SecurityBackControl';

type SSOBypassAllowlistPageProps = {
  onBack: () => void;
};

const MEMBER_LOOKUP_PAGE_SIZE = 10;
const ROLE_MEMBERS_PAGE_SIZE = 100;

type BulkResult = { added: number; skipped: number };
type AddMode = 'email' | 'role';
type RoleOption = { value: string; label: string };

const findMemberByEmail = async (organization: OrganizationResource, email: string) => {
  const { data } = await organization.getMemberships({ query: email, pageSize: MEMBER_LOOKUP_PAGE_SIZE });
  const wanted = email.toLowerCase();
  return data.find(membership => membership.publicUserData?.identifier?.toLowerCase() === wanted);
};

const useRoleMemberCounts = (
  organization: OrganizationResource | null | undefined,
  roles: RoleOption[] | undefined,
) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const roleKeys = (roles ?? []).map(role => role.value).join(',');

  useEffect(() => {
    if (!organization || !roleKeys) {
      return;
    }
    let cancelled = false;
    void Promise.all(
      roleKeys.split(',').map(async role => {
        const { total_count } = await organization.getMemberships({ role: [role], pageSize: 1 });
        return [role, total_count] as const;
      }),
    )
      .then(entries => {
        if (!cancelled) {
          setCounts(Object.fromEntries(entries));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [organization, roleKeys]);

  return counts;
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

const bulkResultText = (result: BulkResult): LocalizationKey[] => {
  if (result.added === 0 && result.skipped === 0) {
    return [localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.none')];
  }
  const added =
    result.added === 1
      ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added__one')
      : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added', {
          count: String(result.added),
        });
  if (result.skipped === 0) {
    return [added];
  }
  const skipped =
    result.skipped === 1
      ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.skipped__one')
      : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.skipped', {
          count: String(result.skipped),
        });
  return result.added === 0 ? [skipped] : [added, skipped];
};

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
        text={bulkResult ? bulkResultText(bulkResult) : undefined}
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
    const { t } = useLocalizations();
    const [mode, setMode] = useState<AddMode>('email');
    const [role, setRole] = useState('');
    const { organization } = useOrganization();
    const { options: roles } = useFetchRoles();
    const roleCounts = useRoleMemberCounts(organization, roles);

    const emailField = useFormControl('emailAddress', '', {
      type: 'email',
      label: localizationKeys('formFieldLabel__emailAddress'),
      placeholder: localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.emailPlaceholder'),
      isRequired: true,
    });

    const roleOptions = useMemo(
      () =>
        (roles ?? []).map(option => {
          const count = roleCounts[option.value];
          return count === undefined
            ? option
            : {
                ...option,
                label: t(
                  localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.roleOption', {
                    role: option.label,
                    count: String(count),
                  }),
                ),
              };
        }),
      [roles, roleCounts, t],
    );

    const email = emailField.value.trim();
    const canSubmit = !card.isLoading && (mode === 'email' ? email !== '' : Boolean(role));

    const changeMode = (next: AddMode) => {
      card.setError(undefined);
      setMode(next);
    };

    const addByEmail = async (): Promise<BulkResult | undefined> => {
      if (!organization) {
        return;
      }
      const member = await findMemberByEmail(organization, email);
      const userId = member?.publicUserData?.userId;
      if (!userId) {
        card.setError(
          t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__memberNotFound')),
        );
        return;
      }
      if (allowlistedUserIds.has(userId)) {
        card.setError(
          t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.error__alreadyAdded')),
        );
        return;
      }
      await addUser({ userId });
      return { added: 1, skipped: 0 };
    };

    const addByRole = async (): Promise<BulkResult | undefined> => {
      if (!organization) {
        return;
      }
      const userIds = (await collectUserIdsByRole(organization, role)).filter(
        userId => !allowlistedUserIds.has(userId),
      );
      if (userIds.length === 0) {
        return { added: 0, skipped: 0 };
      }
      const added = await addUsers({ userIds });
      return { added: added?.data.length ?? 0, skipped: added?.errors.length ?? 0 };
    };

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      try {
        const result = await card.runAsync(mode === 'email' ? addByEmail : addByRole);
        if (result) {
          onResult(result);
        }
      } catch (err) {
        handleError(err as Error, [emailField], card.setError);
      }
    };

    return (
      <FormContainer
        headerTitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.title')}
        headerSubtitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.subtitle')}
      >
        <Form.Root onSubmit={onSubmit}>
          <SegmentedControl.Root
            aria-label={t(localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.modeLabel'))}
            value={mode}
            onChange={next => changeMode(next as AddMode)}
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
            <Form.ControlRow elementId={emailField.id}>
              <Form.PlainInput
                {...emailField.props}
                autoFocus
                ignorePasswordManager
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassEmailInput}
              />
            </Form.ControlRow>
          ) : (
            <Col gap={2}>
              <RoleSelect
                roles={roleOptions}
                value={role}
                onChange={setRole}
                isDisabled={card.isLoading}
                triggerSx={t => ({ width: '100%', justifyContent: 'space-between', color: t.colors.$colorForeground })}
              />
              <Flex
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassRoleWarning}
                align='center'
                gap={2}
              >
                <Icon
                  icon={ExclamationTriangle}
                  size='sm'
                  colorScheme='neutral'
                />
                <Text
                  as='span'
                  colorScheme='secondary'
                  variant='caption'
                  localizationKey={localizationKeys(
                    'organizationProfile.securityPage.ssoBypassPage.addForm.roleWarning',
                  )}
                />
              </Flex>
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
