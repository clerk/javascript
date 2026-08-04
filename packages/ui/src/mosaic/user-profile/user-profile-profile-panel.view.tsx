import * as stylex from '@stylexjs/stylex';
import type { ChangeEvent, ReactElement } from 'react';
import { Fragment, useId } from 'react';

import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { Heading } from '../components/heading';
import { Icon } from '../components/icon';
import { Input } from '../components/input';
import { Item } from '../components/item';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import { colorVars, space } from '../tokens.stylex';
import { styles } from './user-profile-profile-panel.styles';

export interface UserProfileEmail {
  id: string;
  value: string;
  isDefault?: boolean;
}

export interface UserProfilePhone {
  id: string;
  value: string;
}

export interface UserProfileConnectedAccount {
  id: string;
  provider: string;
  identifier?: string;
  iconUrl?: string;
  connected?: boolean;
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
  onAddPhone?: () => void;
  onManagePhone?: (id: string) => void;
  onConnectAccount?: (id: string) => void;
  onManageConnectedAccount?: (id: string) => void;
  onDeleteAccount?: () => void;
}

function Divider() {
  return <div {...mergeStyleProps(themeProps('user-profile-profile-panel-divider'), stylex.props(styles.divider))} />;
}

function FieldRow({ label, value, onChange }: { label: string; value: string; onChange?: (value: string) => void }) {
  const inputId = useId();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);

  return (
    <div {...mergeStyleProps(themeProps('user-profile-profile-panel-field-row'), stylex.props(styles.row))}>
      <label htmlFor={inputId}>
        <Text
          render={props => <span {...props} />}
          color='neutral'
          style={{ fontWeight: 510 }}
        >
          {label}
        </Text>
      </label>
      <Input
        aria-label={label}
        id={inputId}
        readOnly={!onChange}
        size='md'
        value={value}
        onChange={handleChange}
        {...stylex.props(styles.input)}
      />
    </div>
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
  onAddPhone,
  onManagePhone,
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
  | 'onAddPhone'
  | 'onManagePhone'
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
              color='neutral'
              style={{ fontWeight: 510 }}
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
                  variant='ghost'
                  onClick={onEditProfilePicture}
                  {...stylex.props(styles.avatarButton)}
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
            label='Email'
            onAdd={onAddEmail}
            onManage={onManageEmail}
          />
          <ContactSection
            items={phones}
            label='Phone'
            onAdd={onAddPhone}
            onManage={onManagePhone}
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
}: {
  accounts: UserProfileConnectedAccount[];
  onConnect?: (id: string) => void;
  onManage?: (id: string) => void;
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
                      {connected && onManage ? (
                        <Button
                          aria-label={`Manage ${account.provider}`}
                          color='neutral'
                          shape='square'
                          size='sm'
                          touchTarget={false}
                          variant='ghost'
                          onClick={() => onManage(account.id)}
                        >
                          <Icon name='ellipsis' />
                        </Button>
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
              <Text color='neutral'>Delete account</Text>
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
  label,
  items,
  onAdd,
  onManage,
  divided,
}: {
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
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
          color='neutral'
          style={{ fontWeight: 510 }}
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
        {items.map(item => (
          <Item.Root
            key={item.id}
            size='xs'
          >
            <Item.Content>
              <div {...stylex.props(styles.contactValue)}>
                <Text
                  render={props => <span {...props} />}
                  color='neutral'
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
            {onManage ? (
              <Item.Actions>
                <Button
                  aria-label={`Manage ${item.value}`}
                  color='neutral'
                  shape='square'
                  size='sm'
                  touchTarget={false}
                  variant='ghost'
                  onClick={() => onManage(item.id)}
                >
                  <Icon name='ellipsis' />
                </Button>
              </Item.Actions>
            ) : null}
          </Item.Root>
        ))}
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
  onAddPhone,
  onManagePhone,
  onConnectAccount,
  onManageConnectedAccount,
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
        onNameChange={onNameChange}
        onUsernameChange={onUsernameChange}
      />
      {connectedAccounts.length > 0 ? (
        <ConnectedAccountsSection
          accounts={connectedAccounts}
          onConnect={onConnectAccount}
          onManage={onManageConnectedAccount}
        />
      ) : null}
      {onDeleteAccount ? <DangerZoneSection onDelete={onDeleteAccount} /> : null}
    </div>
  );
}
