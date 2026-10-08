import type React from 'react';

import { ExclamationTriangle, InformationCircle, UserPlus } from '@/icons';
import { Action } from '@/ui/elements/Action';
import { Alert } from '@/ui/elements/Alert';
import { Animated } from '@/ui/elements/Animated';
import { Card } from '@/ui/elements/Card';
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
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import { Wizard } from '../../common';
import { Badge, Button, Col, descriptors, Flex, Icon, localizationKeys, Td, Text } from '../../customizables';
import { mqu } from '../../styledSystem';
import { RoleSelect } from './MemberListTable';
import { SecurityBackControl } from './SecurityBackControl';
import type {
  useSSOBypassAddMemberFormController,
  useSSOBypassAddMemberScreenController,
  useSSOBypassAllowlistController,
} from './sso-bypass-allowlist.controller';
import type {
  AddMemberFormProps,
  AddMemberProps,
  AddMode,
  AllowlistRowProps,
  FormMessage,
  SSOBypassAllowlistPageProps,
} from './sso-bypass-allowlist.types';

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

export const SSOBypassAllowlistPageView = ({
  onBack,
  controller,
  AddMemberScreen,
  AllowlistRow,
}: SSOBypassAllowlistPageProps & {
  controller: ReturnType<typeof useSSOBypassAllowlistController>;
  AddMemberScreen: React.ComponentType<AddMemberProps>;
  AllowlistRow: React.ComponentType<AllowlistRowProps>;
}): JSX.Element => {
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
                    value={controller.search}
                    aria-label={controller.searchLabel}
                    placeholder={controller.searchLabel}
                    elementDescriptor={descriptors.organizationProfileSecuritySsoBypassSearchInput}
                    leftIconElementDescriptor={descriptors.organizationProfileSecuritySsoBypassSearchInputIcon}
                    onChange={e => controller.onSearchChange(e.target.value)}
                    onClear={controller.onSearchClear}
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
                    scopeKey={controller.scopeKey}
                    canRun={controller.canRun}
                    allowlistedUserIds={controller.allowlistedUserIds}
                    addUser={controller.addUser}
                    addUsers={controller.addUsers}
                  />
                </Action.Card>
              </Flex>
            </Action.Open>
          </Action.Root>

          <Card.Alert>{controller.cardError}</Card.Alert>

          {controller.errorMessage !== undefined ? (
            <Alert
              variant='danger'
              title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.error__load')}
              subtitle={controller.errorMessage}
            />
          ) : (
            <DataTable
              page={1}
              onPageChange={() => {}}
              itemCount={controller.entries.length}
              pageCount={1}
              itemsPerPage={Math.max(controller.entries.length, 1)}
              isLoading={controller.isLoading}
              emptyStateLocalizationKey={
                controller.term
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
              rows={controller.entries.map(row => (
                <AllowlistRow
                  key={row.entry.userId}
                  entry={row.entry}
                  isCurrentUser={row.isCurrentUser}
                  onRemove={row.onRemove}
                  isLoading={row.isLoading}
                />
              ))}
            />
          )}
        </Col>
      </Col>
    </ProfileCard.Page>
  );
};

export const SSOBypassAllowlistRowView = ({
  entry,
  isCurrentUser,
  onRemove,
  isLoading,
}: AllowlistRowProps): JSX.Element => {
  return (
    <DataTableRow>
      <Td>
        <UserPreviewView
          sx={{ maxWidth: '30ch' }}
          {...entry.preview}
          subtitle={entry.subtitle}
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
                isDisabled: isLoading,
                onClick: onRemove,
              },
            ]}
          />
        </Flex>
      </Td>
    </DataTableRow>
  );
};

export const SSOBypassAddMemberScreenView = ({
  controller,
  AddMemberForm,
}: {
  controller: ReturnType<typeof useSSOBypassAddMemberScreenController>;
  AddMemberForm: React.ComponentType<AddMemberFormProps>;
}): JSX.Element => {
  return (
    <Wizard step={controller.bulkResult ? 1 : 0}>
      <AddMemberForm
        {...controller.props}
        onReset={controller.onReset}
        onResult={controller.onResult}
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
                localizationKey={controller.addedLabel}
                sx={{ textAlign: 'center' }}
              />
            </Flex>
            {controller.bulkResult && controller.bulkResult.skipped > 0 && (
              <Alert
                variant='warning'
                title={controller.skippedLabel}
              />
            )}
          </Col>
        }
        onFinish={controller.onReset}
      />
    </Wizard>
  );
};

export const SSOBypassAddMemberFormView = (
  controller: ReturnType<typeof useSSOBypassAddMemberFormController>,
): JSX.Element => {
  return (
    <FormContainer
      gap={4}
      headerTitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.title')}
      headerSubtitle={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.subtitle')}
    >
      <Form.Root
        gap={4}
        onSubmit={controller.onSubmit}
      >
        <SegmentedControl.Root
          aria-label={controller.modeLabel}
          value={controller.mode}
          onChange={next => controller.onChangeMode(next as AddMode)}
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

        {controller.mode === 'email' ? (
          <Col gap={2}>
            <Form.ControlRow elementId={controller.emailField.id}>
              <Form.PlainInput
                {...controller.emailField.props}
                autoFocus
                ignorePasswordManager
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassEmailInput}
              />
            </Form.ControlRow>
            {controller.failure && (
              <InlineMessage
                icon={ExclamationTriangle}
                text={controller.failure}
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassFailure}
              />
            )}
          </Col>
        ) : (
          <Col gap={2}>
            <RoleSelect
              roles={controller.roles}
              value={controller.role}
              formatLabel={controller.formatRoleLabel}
              onChange={controller.onChangeRole}
              isDisabled={controller.isLoading}
              triggerSx={t => ({ width: '100%', justifyContent: 'space-between', color: t.colors.$colorForeground })}
            />
            {controller.failure && (
              <InlineMessage
                icon={ExclamationTriangle}
                text={controller.failure}
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
          isDisabled={!controller.canSubmit}
          submitLabel={localizationKeys('organizationProfile.securityPage.ssoBypassPage.addForm.submitButton')}
          onReset={controller.onReset}
        />
      </Form.Root>
    </FormContainer>
  );
};
