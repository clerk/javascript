import type { FileRejection, FileRejectionReason } from '@clerk/headless/file-upload';
import { FileUpload } from '@clerk/headless/file-upload';
import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { createConfirmHandle, Dialog } from '../../components/dialog';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import { Text } from '../../components/text';
import type { UserProfileMenuAction } from '../user-profile-action-menu';
import { UserProfileActionMenu } from '../user-profile-action-menu';
import { styles } from '../user-profile-profile-panel.styles';
import { fill, userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import type { UserProfileNameAttribute } from './user-profile-account-section.types';
import { useUserProfileEditNameController } from './user-profile-edit-name.controller';
import type { UserProfileEditNameValue } from './user-profile-edit-name.view';
import { UserProfileEditNameView } from './user-profile-edit-name.view';

const PROFILE_PICTURE_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
/** Matches the limit the row's own description advertises. */
const PROFILE_PICTURE_MAX_BYTES = 10 * 1000 * 1000;

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
  /** Passed alongside `name`, which cannot be split back into its two halves. */
  firstName?: string;
  lastName?: string;
  /** How the instance configures each half of the name; both enabled and optional by default. */
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  onProfilePictureChange?: (file: File) => void;
  /**
   * Called with the files the picker turned away for type or size. The row already tells the user
   * why, so this is for whatever else a consumer wants to do with them — logging, or a toast once
   * there is one.
   */
  onProfilePictureReject?: (rejections: FileRejection[]) => void;
  onRemoveProfilePicture?: () => void;
  /** Resolve to close the dialog; reject with an `Error` to keep it open showing why. Omit to hide the action. */
  onSubmitName?: (value: UserProfileEditNameValue) => Promise<void>;
  onUsernameChange?: (value: string) => void;
  onAddEmail?: () => void;
  onManageEmail?: (id: string) => void;
  onVerifyEmail?: (id: string) => void;
  onSetPrimaryEmail?: (id: string) => void | Promise<void>;
  onRemoveEmail?: (id: string) => void | Promise<void>;
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
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  emails,
  phones,
  onProfilePictureChange,
  onProfilePictureReject,
  onRemoveProfilePicture,
  onSubmitName,
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
  const [rejection, setRejection] = useState<FileRejectionReason | null>(null);
  const updateUsername = onUsernameChange ? () => onUsernameChange(username) : undefined;

  return (
    <FileUpload.Root
      accept={PROFILE_PICTURE_MIME_TYPES}
      maxSize={PROFILE_PICTURE_MAX_BYTES}
      render={<div {...stylex.props(styles.sections)} />}
      onReject={rejections => {
        setRejection(rejections[0]?.reason ?? null);
        onProfilePictureReject?.(rejections);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          setRejection(null);
          onProfilePictureChange?.(file);
        }
      }}
    >
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
              <ProfilePictureActions
                canChange={Boolean(onProfilePictureChange)}
                hasImage={hasImage}
                onRemove={onRemoveProfilePicture}
              />
            </Section.Item>
            {rejection ? <Section.Error>{m.picture.errors[rejection]}</Section.Error> : null}
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>{m.name.label}</Section.Label>
                <Section.Description>{name}</Section.Description>
              </Section.Content>
              {onSubmitName ? (
                <Section.Actions>
                  <EditName
                    firstName={firstName}
                    lastName={lastName}
                    firstNameAttribute={firstNameAttribute}
                    lastNameAttribute={lastNameAttribute}
                    onSubmit={onSubmitName}
                  />
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
        <EmailContactSection
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
    </FileUpload.Root>
  );
}

/**
 * Sits inside `FileUpload.Root` so it can open the picker from a menu item, which is a plain
 * callback rather than a `FileUpload.Trigger` button.
 */
function ProfilePictureActions({
  hasImage,
  canChange,
  onRemove,
}: {
  hasImage: boolean;
  canChange: boolean;
  onRemove?: () => void;
}) {
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: UserProfileMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.picture.change, icon: 'pen', onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.picture.remove, icon: 'close', onClick: onRemove });
  }

  if (actions.length > 0) {
    return (
      <Section.Actions>
        <UserProfileActionMenu
          actions={actions}
          label={m.picture.manage}
        />
      </Section.Actions>
    );
  }

  if (!hasImage && canChange) {
    return (
      <Section.Actions>
        <FileUpload.Trigger
          render={
            <Button
              color='neutral'
              size='sm'
              variant='outline'
            />
          }
        >
          {m.picture.upload}
        </FileUpload.Trigger>
      </Section.Actions>
    );
  }

  return null;
}

function EditName({
  firstName,
  lastName,
  firstNameAttribute,
  lastNameAttribute,
  onSubmit,
}: {
  firstName?: string;
  lastName?: string;
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  onSubmit: (value: UserProfileEditNameValue) => Promise<void>;
}) {
  const controller = useUserProfileEditNameController({ firstName, lastName, onSubmit });

  return (
    <UserProfileEditNameView
      {...controller}
      firstNameAttribute={firstNameAttribute}
      lastNameAttribute={lastNameAttribute}
      open={controller.isOpen}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {m.name.edit}
        </Button>
      }
    />
  );
}

interface ContactSectionProps {
  kind: 'email' | 'phone';
  label: string;
  items: Array<{ id: string; value: string; isDefault?: boolean; isVerified?: boolean; canRemove?: boolean }>;
  onAdd?: () => void;
  onManage?: (id: string) => void;
  onVerify?: (id: string) => void;
  onSetPrimary?: (id: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
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

function EmailContactSection(props: ContactSectionProps) {
  const { items, onSetPrimary, onRemove } = props;
  const messages = m.email;
  const sectionRef = useRef<HTMLElement>(null);
  const removeConfirm = useMemo(() => createConfirmHandle(), []);
  const [contactToRemove, setContactToRemove] = useState<ContactSectionProps['items'][number]>();
  const [removeError, setRemoveError] = useState<string>();
  const removing = useRef(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);
  const [primaryError, setPrimaryError] = useState<string>();
  const settingPrimary = useRef(false);

  const setPrimary = async (id: string) => {
    const contact = items.find(item => item.id === id);
    if (!onSetPrimary || !contact?.isVerified || contact.isDefault || settingPrimary.current) {
      return;
    }
    settingPrimary.current = true;
    setIsSettingPrimary(true);
    setPrimaryError(undefined);
    try {
      await onSetPrimary(id);
    } catch (error) {
      setPrimaryError(error instanceof Error ? error.message : messages.primaryError);
    } finally {
      settingPrimary.current = false;
      setIsSettingPrimary(false);
    }
  };

  const removeContact = async (id: string) => {
    const contact = items.find(item => item.id === id);
    if (!contact || contact.canRemove === false || !onRemove || removing.current) {
      return;
    }
    removing.current = true;
    setContactToRemove(contact);
    setRemoveError(undefined);
    try {
      const [beforeEmail, afterEmail] = messages.removeDialog.description.split('{emailAddress}');
      const confirmed = await removeConfirm.show({
        title: messages.removeDialog.title,
        description: (
          <>
            {beforeEmail}
            <strong {...stylex.props(styles.confirmationContactValue)}>{contact.value}</strong>
            {afterEmail}
          </>
        ),
        actionLabel: messages.removeDialog.confirm,
        cancelLabel: messages.removeDialog.cancel,
        destructive: true,
      });
      if (confirmed) {
        await onRemove(id);
      }
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : messages.removeError);
    } finally {
      removing.current = false;
    }
  };

  return (
    <Section.Root
      ref={sectionRef}
      aria-label={props.label}
    >
      <Section.Group>
        <ContactRow
          {...props}
          onManage={isSettingPrimary ? undefined : props.onManage}
          onSetPrimary={onSetPrimary && !isSettingPrimary ? id => void setPrimary(id) : undefined}
          onRemove={onRemove ? id => void removeContact(id) : undefined}
        />
      </Section.Group>
      {primaryError ? (
        <Text
          role='alert'
          color='negative'
        >
          {primaryError}
        </Text>
      ) : null}
      {removeError ? (
        <Text
          role='alert'
          color='negative'
        >
          {removeError}
        </Text>
      ) : null}
      <Dialog.Confirm
        handle={removeConfirm}
        finalFocus={() => {
          const buttons = Array.from(sectionRef.current?.querySelectorAll('button') ?? []);
          const label = contactToRemove ? fill(m.manageValue, { value: contactToRemove.value }) : '';
          return (
            buttons.find(button => button.getAttribute('aria-label') === label) ??
            buttons.find(button => button.getAttribute('aria-label') === messages.add) ??
            buttons[0] ??
            false
          );
        }}
      />
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
              actions.push({ label: m.setPrimary, onClick: () => void onSetPrimary(item.id) });
            }

            if (onRemove && item.canRemove !== false) {
              actions.push({
                label: m[kind].remove,
                color: 'negative',
                onClick: () => void onRemove(item.id),
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
