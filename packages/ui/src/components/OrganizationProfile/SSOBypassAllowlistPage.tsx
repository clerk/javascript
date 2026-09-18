import { __internal_useOrganizationSSOBypassAllowlist, useOrganization, useUser } from '@clerk/shared/react';
import type {
  AddSSOBypassAllowlistUserParams,
  AddSSOBypassAllowlistUsersParams,
  OrganizationCustomRoleKey,
  OrganizationMembershipResource,
  OrganizationResource,
  SSOBypassAllowlistBulkCreateResult,
  SSOBypassAllowlistUserResource,
} from '@clerk/shared/types';
import React, { useMemo, useRef, useState } from 'react';

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
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { UserPreview } from '@/ui/elements/UserPreview';
import { handleError } from '@/ui/utils/errorHandler';

import type { LocalizationKey } from '../../customizables';
import {
  Badge,
  Button,
  Col,
  descriptors,
  Flex,
  localizationKeys,
  Td,
  Text,
  useLocalizations,
} from '../../customizables';
import { useFetchRoles } from '../../hooks/useFetchRoles';
import { mqu } from '../../styledSystem';
import { RoleSelect } from './MemberListTable';
import { SecurityBackControl } from './SecurityBackControl';

type SSOBypassAllowlistPageProps = {
  onBack: () => void;
};

const MEMBER_SEARCH_DEBOUNCE_MS = 500;
const MEMBER_SEARCH_PAGE_SIZE = 10;
const ROLE_MEMBERS_PAGE_SIZE = 100;

type BulkResult = { added: number; skipped: number };

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

const bulkResultMessages = (
  result: BulkResult,
): { variant: 'info' | 'warning'; title: LocalizationKey; subtitle?: LocalizationKey } => {
  if (result.added === 0 && result.skipped === 0) {
    return {
      variant: 'info',
      title: localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.none'),
    };
  }
  const title =
    result.added === 1
      ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added__one')
      : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.added', {
          count: String(result.added),
        });
  if (result.skipped === 0) {
    return { variant: 'info', title };
  }
  return {
    variant: 'warning',
    title,
    subtitle:
      result.skipped === 1
        ? localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.skipped__one')
        : localizationKeys('organizationProfile.securityPage.ssoBypassPage.bulkResult.skipped', {
            count: String(result.skipped),
          }),
  };
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
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
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
                    onClick={() => setBulkResult(null)}
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
                    onBulkResult={setBulkResult}
                  />
                </Action.Card>
              </Flex>
            </Action.Open>
          </Action.Root>

          <Card.Alert>{card.error}</Card.Alert>

          {bulkResult && (
            <Alert
              {...bulkResultMessages(bulkResult)}
              elementDescriptor={descriptors.organizationProfileSecuritySsoBypassBulkResult}
            />
          )}

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
  onBulkResult: (result: BulkResult) => void;
};

const AddMemberScreen = (props: AddMemberProps): JSX.Element => {
  const { close } = useActionContext();

  return (
    <AddMemberForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  );
};

const AddMemberForm = withCardStateProvider(
  ({
    allowlistedUserIds,
    addUser,
    addUsers,
    onBulkResult,
    onSuccess,
    onReset,
  }: AddMemberProps & { onSuccess: () => void; onReset: () => void }): JSX.Element => {
    const card = useCardState();
    const { t } = useLocalizations();
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<OrganizationMembershipResource | null>(null);
    const [role, setRole] = useState('');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { options: roles } = useFetchRoles();

    const { organization, memberships } = useOrganization({
      memberships: {
        keepPreviousData: true,
        pageSize: MEMBER_SEARCH_PAGE_SIZE,
        query: query || undefined,
      },
    });

    const options = (memberships?.data ?? []).filter(membership => {
      const userId = membership.publicUserData?.userId;
      return Boolean(userId) && !allowlistedUserIds.has(userId as string);
    });

    const handleSearchChange = (value: string) => {
      setSearch(value);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (value.trim() === '') {
        setQuery('');
        return;
      }
      debounceTimer.current = setTimeout(() => setQuery(value.trim()), MEMBER_SEARCH_DEBOUNCE_MS);
    };

    const handleClear = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setSearch('');
      setQuery('');
    };

    const selectedUserId = selected?.publicUserData?.userId;
    const canSubmit = Boolean(selectedUserId) && !card.isLoading;

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedUserId || card.isLoading) {
        return;
      }

      try {
        await card.runAsync(() => addUser({ userId: selectedUserId }));
        onSuccess();
      } catch (err) {
        handleError(err as Error, [], card.setError);
      }
    };

    const onAddAll = async () => {
      if (!role || !organization || card.isLoading) {
        return;
      }

      try {
        const result = await card.runAsync(async () => {
          const userIds = (await collectUserIdsByRole(organization, role)).filter(
            userId => !allowlistedUserIds.has(userId),
          );
          if (userIds.length === 0) {
            return { added: 0, skipped: 0 };
          }
          const added = await addUsers({ userIds });
          return { added: added?.data.length ?? 0, skipped: added?.errors.length ?? 0 };
        });
        onBulkResult(result);
        onSuccess();
      } catch (err) {
        handleError(err as Error, [], card.setError);
      }
    };

    return (
      <FormContainer
        headerTitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.title')}
        headerSubtitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.subtitle')}
      >
        <Form.Root onSubmit={onSubmit}>
          <Col gap={2}>
            <Text
              as='span'
              variant='subtitle'
              localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.memberLabel')}
            />

            {selected ? (
              <Flex
                align='center'
                justify='between'
                gap={2}
                sx={t => ({
                  padding: `${t.space.$2} ${t.space.$3}`,
                  borderRadius: t.radii.$md,
                  borderWidth: t.borderWidths.$normal,
                  borderStyle: t.borderStyles.$solid,
                  borderColor: t.colors.$borderAlpha150,
                })}
              >
                <UserPreview
                  size='sm'
                  user={selected.publicUserData}
                  subtitle={selected.publicUserData?.identifier}
                  subtitleProps={{ variant: 'caption' }}
                />
                <Button
                  type='button'
                  variant='ghost'
                  colorScheme='secondary'
                  size='xs'
                  onClick={() => setSelected(null)}
                  localizationKey={localizationKeys(
                    'organizationProfile.securityPage.ssoBypassPage.addForm.changeButton',
                  )}
                />
              </Flex>
            ) : (
              <>
                <SearchInput
                  value={search}
                  autoFocus
                  isLoading={Boolean(search) && Boolean(memberships?.isFetching)}
                  aria-label={t(
                    localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.memberPlaceholder'),
                  )}
                  placeholder={t(
                    localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.memberPlaceholder'),
                  )}
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassMemberSearchInput}
                  leftIconElementDescriptor={descriptors.organizationProfileSecuritySsoBypassMemberSearchInputIcon}
                  onChange={e => handleSearchChange(e.target.value)}
                  onClear={handleClear}
                />

                <Col
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassMemberOptions}
                  role='listbox'
                  sx={t => ({
                    maxHeight: t.sizes.$60,
                    overflowY: 'auto',
                    gap: t.space.$0x5,
                  })}
                >
                  {options.map(membership => (
                    <Button
                      key={membership.id}
                      type='button'
                      role='option'
                      aria-selected={false}
                      variant='unstyled'
                      elementDescriptor={descriptors.organizationProfileSecuritySsoBypassMemberOption}
                      onClick={() => setSelected(membership)}
                      sx={t => ({
                        display: 'flex',
                        justifyContent: 'flex-start',
                        width: '100%',
                        height: 'auto',
                        padding: `${t.space.$1x5} ${t.space.$2}`,
                        borderRadius: t.radii.$md,
                        ':hover, :focus-visible': { backgroundColor: t.colors.$neutralAlpha50 },
                      })}
                    >
                      <UserPreview
                        size='sm'
                        user={membership.publicUserData}
                        subtitle={membership.publicUserData?.identifier}
                        subtitleProps={{ variant: 'caption' }}
                      />
                    </Button>
                  ))}

                  {options.length === 0 && !memberships?.isLoading && (
                    <Text
                      colorScheme='secondary'
                      variant='caption'
                      localizationKey={localizationKeys(
                        'organizationProfile.securityPage.ssoBypassPage.addForm.noResults',
                      )}
                    />
                  )}
                </Col>
              </>
            )}
          </Col>

          {roles && roles.length > 0 && (
            <Col gap={2}>
              <Text
                as='span'
                variant='subtitle'
                localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.roleLabel')}
              />
              <Flex
                align='center'
                gap={2}
              >
                <RoleSelect
                  roles={roles}
                  value={role}
                  onChange={setRole}
                  isDisabled={card.isLoading}
                  triggerSx={t => ({ width: 'auto', color: t.colors.$colorForeground })}
                />
                <Button
                  type='button'
                  variant='bordered'
                  colorScheme='secondary'
                  size='sm'
                  elementDescriptor={descriptors.organizationProfileSecuritySsoBypassAddAllButton}
                  isDisabled={!role || card.isLoading}
                  onClick={() => void onAddAll()}
                  localizationKey={localizationKeys(
                    'organizationProfile.securityPage.ssoBypassPage.addForm.addAllButton',
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
