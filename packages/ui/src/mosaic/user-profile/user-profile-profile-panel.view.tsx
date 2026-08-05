import * as stylex from '@stylexjs/stylex';
import type { ChangeEvent, ReactElement } from 'react';
import { Fragment } from 'react';

import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { Item } from '../components/item';
import { Menu } from '../components/menu';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import { colorVars, fontWeightVars, space } from '../tokens.stylex';
import { styles } from './user-profile-profile-panel.styles';

export interface UserProfileEmail {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfilePhone {
  id: string;
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  canRemove?: boolean;
}

export interface UserProfileConnectedAccount {
  id: string;
  provider: string;
  identifier?: string;
  iconUrl?: string;
  connected?: boolean;
  canRemove?: boolean;
}

export interface UserProfileProfilePanelViewProps {
  imageUrl?: string;
  name: string;
  username: string;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  connectedAccounts?: UserProfileConnectedAccount[];
  onEditProfilePicture?: () => void;
  onNameChange?: (value: string) => void;
  onUsernameChange?: (value: string) => void;
  onAddEmail?: () => void;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void;
  onRemoveEmail?: (id: string) => void;
  onAddPhone?: () => void;
  onManagePhone?: (id: string) => void;
  onVerifyPhone?: (id: string) => void;
  onSetPrimaryPhone?: (id: string) => void;
  onRemovePhone?: (id: string) => void;
  onConnectAccount?: (id: string) => void;
  onManageConnectedAccount?: (id: string) => void;
  onRemoveConnectedAccount?: (id: string) => void;
  onDeleteAccount?: () => void;
}

interface ProfileMenuAction {
  label: string;
  color?: 'neutral' | 'negative';
  onClick: () => void;
}

function ProfileActionMenu({ label, actions }: { label: string; actions: ProfileMenuAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger aria-label={label} />
      <Menu.Content>
        {actions.map(action => (
          <Menu.Item
            key={action.label}
            color={action.color}
            label={action.label}
            onClick={action.onClick}
          />
        ))}
      </Menu.Content>
    </Menu.Root>
  );
}

function Divider() {
  return <div {...mergeStyleProps(themeProps('user-profile-profile-panel-divider'), stylex.props(styles.divider))} />;
}

function FieldRow({ label, value, onChange }: { label: string; value: string; onChange?: (value: string) => void }) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);

  return (
    <Field.Root {...mergeStyleProps(themeProps('user-profile-profile-panel-field-row'), stylex.props(styles.row))}>
      <Field.Label>{label}</Field.Label>
      <Input
        readOnly={!onChange}
        size='md'
        style={{ flexShrink: 0, maxWidth: '50%', width: '10.9375rem' }}
        value={value}
        onChange={handleChange}
      />
    </Field.Root>
  );
}

function AccountSection({
  imageUrl,
  name,
  username,
  emails,
  phones,
  onEditProfilePicture,
  onNameChange,
  onUsernameChange,
  onAddEmail,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
  onAddPhone,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
}: Pick<
  UserProfileProfilePanelViewProps,
  | 'imageUrl'
  | 'name'
  | 'username'
  | 'emails'
  | 'phones'
  | 'onEditProfilePicture'
  | 'onNameChange'
  | 'onUsernameChange'
  | 'onAddEmail'
  | 'onManageEmail'
  | 'onVerifyEmail'
  | 'onSetPrimaryEmail'
  | 'onRemoveEmail'
  | 'onAddPhone'
  | 'onManagePhone'
  | 'onVerifyPhone'
  | 'onSetPrimaryPhone'
  | 'onRemovePhone'
>) {
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatar = (
    <Avatar.Root
      aria-hidden={Boolean(onEditProfilePicture)}
      size='md'
    >
      <Avatar.Image
        alt={name}
        src={imageUrl}
      />
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar.Root>
  );

  return (
    <section
      aria-labelledby='user-profile-profile-panel-account'
      {...stylex.props(styles.section)}
    >
      <Heading
        id='user-profile-profile-panel-account'
        render={props => <h4 {...props} />}
        size='xs'
      >
        Account
      </Heading>
      <Card.Root
        elevation='flush'
        {...stylex.props(styles.card)}
      >
        <Card.Content style={{ paddingInline: 0 }}>
          <div {...mergeStyleProps(themeProps('user-profile-profile-panel-picture-row'), stylex.props(styles.row))}>
            <Text
              color='primary'
              style={{ fontWeight: fontWeightVars['--cl-font-medium'] }}
            >
              Profile picture
            </Text>
            <div {...stylex.props(styles.avatarControl)}>
              {onEditProfilePicture ? (
                <Button
                  aria-label='Edit profile picture'
                  color='neutral'
                  shape='circle'
                  size='lg'
                  style={{ borderWidth: 0, position: 'relative' }}
                  variant='ghost'
                  onClick={onEditProfilePicture}
                >
                  {avatar}
                  <span
                    aria-hidden
                    {...stylex.props(styles.avatarEditSurface)}
                  >
                    <Icon
                      aria-hidden
                      name='pen'
                      size='xs'
                    />
                  </span>
                </Button>
              ) : (
                avatar
              )}
            </div>
          </div>
          <Divider />
          <FieldRow
            label='Name'
            value={name}
            onChange={onNameChange}
          />
          <Divider />
          <FieldRow
            label='Username'
            value={username}
            onChange={onUsernameChange}
          />
          <Divider />
          <ContactSection
            divided
            items={emails}
            kind='email'
            label='Email'
            onAdd={onAddEmail}
            onManage={onManageEmail}
            onRemove={onRemoveEmail}
            onSetPrimary={onSetPrimaryEmail}
            onVerify={onVerifyEmail}
          />
          <ContactSection
            items={phones}
            kind='phone'
            label='Phone'
            onAdd={onAddPhone}
            onManage={onManagePhone}
            onRemove={onRemovePhone}
            onSetPrimary={onSetPrimaryPhone}
            onVerify={onVerifyPhone}
          />
        </Card.Content>
      </Card.Root>
    </section>
  );
}

function ConnectedAccountsSection({
  accounts,
  onConnect,
  onManage,
  onRemove,
}: {
  accounts: UserProfileConnectedAccount[];
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <section
      aria-labelledby='user-profile-profile-panel-connected-accounts'
      {...stylex.props(styles.section)}
    >
      <Heading
        id='user-profile-profile-panel-connected-accounts'
        render={props => <h4 {...props} />}
        size='xs'
      >
        Connected accounts
      </Heading>
      <Card.Root
        elevation='flush'
        {...stylex.props(styles.card)}
      >
        <Card.Content style={{ paddingInline: 0 }}>
          <Item.Group>
            {accounts.map((account, index) => {
              const connected = account.connected ?? Boolean(account.identifier);
              const actions: ProfileMenuAction[] = [];
              if (onRemove && account.canRemove !== false) {
                actions.push({
                  label: 'Remove',
                  color: 'negative',
                  onClick: () => onRemove(account.id),
                });
              } else if (!onRemove && onManage) {
                actions.push({ label: 'Manage', onClick: () => onManage(account.id) });
              }
              return (
                <Fragment key={account.id}>
                  {index > 0 ? (
                    <Item.Separator
                      style={{
                        backgroundColor: colorVars['--cl-color-border'],
                        marginBlock: space['2'],
                        marginInline: space['2'],
                        width: 'auto',
                      }}
                    />
                  ) : null}
                  <Item.Root
                    size='md'
                    style={{ height: 'auto', paddingBlock: space['2'] }}
                  >
                    {account.iconUrl ? (
                      <Item.Media style={{ width: space['6'] }}>
                        <img
                          alt=''
                          src={account.iconUrl}
                          {...stylex.props(styles.providerIcon)}
                        />
                      </Item.Media>
                    ) : null}
                    <Item.Content>
                      <Item.Title>{account.provider}</Item.Title>
                      {account.identifier ? <Item.Description>{account.identifier}</Item.Description> : null}
                    </Item.Content>
                    <Item.Actions>
                      {connected ? (
                        <ProfileActionMenu
                          actions={actions}
                          label={`Manage ${account.provider}`}
                        />
                      ) : null}
                      {!connected && onConnect ? (
                        <Button
                          color='neutral'
                          size='sm'
                          variant='outline'
                          onClick={() => onConnect(account.id)}
                        >
                          Connect
                          <Icon
                            name='arrow-right-top'
                            placement='inline-end'
                            size='sm'
                          />
                        </Button>
                      ) : null}
                    </Item.Actions>
                  </Item.Root>
                </Fragment>
              );
            })}
          </Item.Group>
        </Card.Content>
      </Card.Root>
    </section>
  );
}

function DangerZoneSection({ onDelete }: { onDelete: () => void }) {
  return (
    <section
      aria-labelledby='user-profile-profile-panel-danger-zone'
      {...stylex.props(styles.section)}
    >
      <Heading
        id='user-profile-profile-panel-danger-zone'
        render={props => <h4 {...props} />}
        size='xs'
      >
        Danger zone
      </Heading>
      <Card.Root
        elevation='flush'
        {...stylex.props(styles.card)}
      >
        <Card.Content style={{ paddingInline: 0 }}>
          <div {...stylex.props(styles.row)}>
            <div {...stylex.props(styles.dangerContent)}>
              <Text color='primary'>Delete account</Text>
              <Text
                color='neutral'
                size='xs'
              >
                This action is permanent and irreversible.
              </Text>
            </div>
            <Button
              color='negative'
              size='sm'
              variant='outline'
              onClick={onDelete}
            >
              Delete account
            </Button>
          </div>
        </Card.Content>
      </Card.Root>
    </section>
  );
}

function ContactSection({
  kind,
  label,
  items,
  onAdd,
  onManage,
  onVerify,
  onSetPrimary,
  onRemove,
  divided,
}: {
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
  divided?: boolean;
}) {
  return (
    <section aria-labelledby={`user-profile-profile-panel-${label.toLowerCase()}`}>
      <div
        {...mergeStyleProps(
          themeProps('user-profile-profile-panel-contact-header'),
          stylex.props(styles.contactHeader),
        )}
      >
        <Text
          id={`user-profile-profile-panel-${label.toLowerCase()}`}
          color='primary'
          style={{ fontWeight: fontWeightVars['--cl-font-medium'] }}
        >
          {label}
        </Text>
        {onAdd ? (
          <Button
            color='neutral'
            size='sm'
            variant='outline'
            onClick={onAdd}
          >
            Add
          </Button>
        ) : null}
      </div>
      <Item.Group {...stylex.props(styles.contactList)}>
        {items.map(item => {
          const actions: ProfileMenuAction[] = [];
          const hasExplicitActions = Boolean(onVerify || onSetPrimary || onRemove);

          if (item.isVerified === false && onVerify) {
            actions.push({
              label: item.isDefault ? 'Complete verification' : kind === 'email' ? 'Verify' : 'Verify phone number',
              onClick: () => onVerify(item.id),
            });
          } else if (!item.isDefault && item.isVerified === true && onSetPrimary) {
            actions.push({ label: 'Set as primary', onClick: () => onSetPrimary(item.id) });
          }

          if (onRemove && item.canRemove !== false) {
            actions.push({
              label: kind === 'email' ? 'Remove email' : 'Remove phone number',
              color: 'negative',
              onClick: () => onRemove(item.id),
            });
          }

          if (!hasExplicitActions && onManage) {
            actions.push({ label: 'Manage', onClick: () => onManage(item.id) });
          }

          return (
            <Item.Root
              key={item.id}
              size='xs'
            >
              <Item.Content>
                <div {...stylex.props(styles.contactValue)}>
                  <Text
                    render={props => <span {...props} />}
                    color='primary'
                  >
                    {item.value}
                  </Text>
                  {item.isDefault ? (
                    <Badge
                      color='neutral'
                      style={{ backgroundColor: 'rgba(23, 23, 23, 0.06)', color: 'inherit' }}
                    >
                      Default
                    </Badge>
                  ) : null}
                </div>
              </Item.Content>
              {actions.length > 0 ? (
                <Item.Actions>
                  <ProfileActionMenu
                    actions={actions}
                    label={`Manage ${item.value}`}
                  />
                </Item.Actions>
              ) : null}
            </Item.Root>
          );
        })}
      </Item.Group>
      {divided ? <Divider /> : null}
    </section>
  );
}

export function UserProfileProfilePanelView({
  imageUrl,
  name = '',
  username = '',
  emails = [],
  phones = [],
  connectedAccounts = [],
  onEditProfilePicture,
  onNameChange,
  onUsernameChange,
  onAddEmail,
  onManageEmail,
  onVerifyEmail,
  onSetPrimaryEmail,
  onRemoveEmail,
  onAddPhone,
  onManagePhone,
  onVerifyPhone,
  onSetPrimaryPhone,
  onRemovePhone,
  onConnectAccount,
  onManageConnectedAccount,
  onRemoveConnectedAccount,
  onDeleteAccount,
}: UserProfileProfilePanelViewProps): ReactElement {
  return (
    <div {...mergeStyleProps(themeProps('user-profile-profile-panel'), stylex.props(styles.root))}>
      <Heading
        render={props => <h3 {...props} />}
        size='base'
      >
        Profile
      </Heading>
      <AccountSection
        emails={emails}
        imageUrl={imageUrl}
        name={name}
        phones={phones}
        username={username}
        onAddEmail={onAddEmail}
        onAddPhone={onAddPhone}
        onEditProfilePicture={onEditProfilePicture}
        onManageEmail={onManageEmail}
        onManagePhone={onManagePhone}
        onRemoveEmail={onRemoveEmail}
        onRemovePhone={onRemovePhone}
        onSetPrimaryEmail={onSetPrimaryEmail}
        onSetPrimaryPhone={onSetPrimaryPhone}
        onVerifyEmail={onVerifyEmail}
        onVerifyPhone={onVerifyPhone}
        onNameChange={onNameChange}
        onUsernameChange={onUsernameChange}
      />
      {connectedAccounts.length > 0 ? (
        <ConnectedAccountsSection
          accounts={connectedAccounts}
          onConnect={onConnectAccount}
          onManage={onManageConnectedAccount}
          onRemove={onRemoveConnectedAccount}
        />
      ) : null}
      {onDeleteAccount ? <DangerZoneSection onDelete={onDeleteAccount} /> : null}
    </div>
  );
}
