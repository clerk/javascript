import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';

import { Avatar } from '../components/avatar';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Icon } from '../components/icon';
import { Section } from '../components/section';
import { fill, userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import type { UserProfileMenuAction } from './user-profile-action-menu';
import { UserProfileActionMenu } from './user-profile-action-menu';
import { styles } from './user-profile-profile-panel.styles';

const PROFILE_PICTURE_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';

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

export interface UserProfileAccountSectionViewProps {
  allowMultipleAccounts?: boolean;
  imageUrl?: string;
  /**
   * Whether `imageUrl` is a picture the user uploaded. Clerk's image service always returns a URL —
   * a generated initials avatar when none was uploaded — so the row cannot tell the two apart from
   * `imageUrl` alone. Supplied from `user.hasImage`.
   */
  hasImage?: boolean;
  name: string;
  username: string;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  onProfilePictureChange?: (file: File) => void;
  onRemoveProfilePicture?: () => void;
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
}

export function UserProfileAccountSectionView({
  allowMultipleAccounts = false,
  imageUrl,
  hasImage = false,
  name,
  username,
  emails,
  phones,
  onProfilePictureChange,
  onRemoveProfilePicture,
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
}: UserProfileAccountSectionViewProps) {
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInputRef.current?.click();
  const pictureActions: UserProfileMenuAction[] = [];

  if (hasImage && onProfilePictureChange) {
    pictureActions.push({ label: m.picture.change, icon: 'pen', onClick: openFilePicker });
  }

  if (hasImage && onRemoveProfilePicture) {
    pictureActions.push({ label: m.picture.remove, icon: 'close', onClick: onRemoveProfilePicture });
  }

  const updateName = onNameChange ? () => onNameChange(name) : undefined;
  const updateUsername = onUsernameChange ? () => onUsernameChange(username) : undefined;

  return (
    <div {...stylex.props(styles.sections)}>
      {onProfilePictureChange ? (
        <input
          ref={fileInputRef}
          accept={PROFILE_PICTURE_MIME_TYPES}
          hidden
          type='file'
          onChange={event => {
            const file = event.currentTarget.files?.[0];
            // Clear the input so re-picking the same file still fires a change event.
            event.currentTarget.value = '';
            if (file) {
              onProfilePictureChange(file);
            }
          }}
        />
      ) : null}
      <Section.Root aria-label={m.sectionLabel}>
        <Section.Title>{m.sectionTitle}</Section.Title>
        <Section.Group>
          <Section.Row>
            <Section.Item>
              <Section.Media size='lg'>
                <Avatar.Root size='fit'>
                  <Avatar.Image
                    alt={name}
                    src={imageUrl}
                  />
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>
              </Section.Media>
              <Section.Content>
                <Section.Label>{m.picture.label}</Section.Label>
                <Section.Description>{m.picture.description}</Section.Description>
              </Section.Content>
              {pictureActions.length > 0 ? (
                <Section.Actions>
                  <UserProfileActionMenu
                    actions={pictureActions}
                    label={m.picture.manage}
                  />
                </Section.Actions>
              ) : !hasImage && onProfilePictureChange ? (
                <Section.Actions>
                  <Button
                    color='neutral'
                    size='sm'
                    variant='outline'
                    onClick={openFilePicker}
                  >
                    {m.picture.upload}
                  </Button>
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m.name.label}</Section.Label>
                <Section.Description>{name}</Section.Description>
              </Section.Content>
              {updateName ? (
                <Section.Actions>
                  <Button
                    color='neutral'
                    size='sm'
                    variant='outline'
                    onClick={updateName}
                  >
                    {m.name.edit}
                  </Button>
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m.username.label}</Section.Label>
                <Section.Description>{username}</Section.Description>
              </Section.Content>
              {updateUsername ? (
                <Section.Actions>
                  <Button
                    color='neutral'
                    size='sm'
                    variant='outline'
                    onClick={updateUsername}
                  >
                    {m.username.edit}
                  </Button>
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          {!allowMultipleAccounts ? (
            <SingleContactRow
              items={emails}
              kind='email'
              label={m.email.label}
              onAdd={onAddEmail}
              onManage={onManageEmail}
            />
          ) : null}
          {!allowMultipleAccounts ? (
            <SingleContactRow
              items={phones}
              kind='phone'
              label={m.phone.label}
              onAdd={onAddPhone}
              onManage={onManagePhone}
            />
          ) : null}
        </Section.Group>
      </Section.Root>
      {allowMultipleAccounts ? (
        <ContactSection
          items={emails}
          kind='email'
          label={m.email.label}
          onAdd={onAddEmail}
          onManage={onManageEmail}
          onRemove={onRemoveEmail}
          onSetPrimary={onSetPrimaryEmail}
          onVerify={onVerifyEmail}
        />
      ) : null}
      {allowMultipleAccounts ? (
        <ContactSection
          items={phones}
          kind='phone'
          label={m.phone.label}
          onAdd={onAddPhone}
          onManage={onManagePhone}
          onRemove={onRemovePhone}
          onSetPrimary={onSetPrimaryPhone}
          onVerify={onVerifyPhone}
        />
      ) : null}
    </div>
  );
}

interface ContactSectionProps {
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function ContactSection(props: ContactSectionProps) {
  return (
    <Section.Root aria-label={props.label}>
      <Section.Group>
        <ContactRow {...props} />
      </Section.Group>
    </Section.Root>
  );
}

function SingleContactRow({ kind, label, items, onAdd, onManage }: ContactSectionProps) {
  const item = items[0];
  const onClick = item ? (onManage ? () => onManage(item.id) : undefined) : onAdd;
  const emptyDescription = m[kind].empty;
  const actionLabel = item ? m[kind].update : m[kind].add;

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          {item ? (
            <Section.Description {...stylex.props(styles.contactValue)}>
              <span>{item.value}</span>
              {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
            </Section.Description>
          ) : (
            <Section.Description>{emptyDescription}</Section.Description>
          )}
        </Section.Content>
        {onClick ? (
          <Section.Actions>
            <Button
              color='neutral'
              size='sm'
              variant='outline'
              onClick={onClick}
            >
              {actionLabel}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
    </Section.Row>
  );
}

function ContactRow({ kind, label, items, onAdd, onManage, onVerify, onSetPrimary, onRemove }: ContactSectionProps) {
  const emptyDescription = m[kind].empty;

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
        </Section.Content>
        {onAdd ? (
          <Section.Actions>
            <Button
              aria-label={m[kind].add}
              color='neutral'
              size='sm'
              variant='outline'
              onClick={onAdd}
            >
              <Icon
                name='plus'
                placement='inline-start'
                size='sm'
              />
              {m.add}
            </Button>
          </Section.Actions>
        ) : null}
      </Section.Item>
      <Section.Items>
        {items.length === 0 ? (
          <Section.Item>
            <Section.Content>
              <Section.Description>{emptyDescription}</Section.Description>
            </Section.Content>
          </Section.Item>
        ) : (
          items.map(item => {
            const actions: UserProfileMenuAction[] = [];
            const hasExplicitActions = Boolean(onVerify || onSetPrimary || onRemove);

            if (item.isVerified === false && onVerify) {
              actions.push({
                label: item.isDefault ? m.completeVerification : m[kind].verify,
                onClick: () => onVerify(item.id),
              });
            } else if (!item.isDefault && item.isVerified === true && onSetPrimary) {
              actions.push({ label: m.setPrimary, onClick: () => onSetPrimary(item.id) });
            }

            if (onRemove && item.canRemove !== false) {
              actions.push({
                label: m[kind].remove,
                color: 'negative',
                onClick: () => onRemove(item.id),
              });
            }

            if (!hasExplicitActions && onManage) {
              actions.push({ label: m.manage, onClick: () => onManage(item.id) });
            }

            return (
              <Section.Item key={item.id}>
                <Section.Content>
                  <Section.Description {...stylex.props(styles.contactValue)}>
                    <span>{item.value}</span>
                    {item.isDefault ? <Badge color='neutral'>{m.primary}</Badge> : null}
                  </Section.Description>
                </Section.Content>
                {actions.length > 0 ? (
                  <Section.Actions>
                    <UserProfileActionMenu
                      actions={actions}
                      label={fill(m.manageValue, { value: item.value })}
                    />
                  </Section.Actions>
                ) : null}
              </Section.Item>
            );
          })
        )}
      </Section.Items>
    </Section.Row>
  );
}
