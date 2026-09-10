import * as stylex from '@stylexjs/stylex';

import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import type { UserProfileMenuAction } from '../user-profile-action-menu';
import { UserProfileActionMenu } from '../user-profile-action-menu';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { useUserProfileEditNameController } from './user-profile-edit-name.controller';
import type { UserProfileEditNameValue } from './user-profile-edit-name.view';
import { UserProfileEditNameView } from './user-profile-edit-name.view';

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
  name: string;
  username: string;
  /** The saved first name, seeding the edit-name dialog. The display `name` cannot be split back into its two halves, so both are passed. */
  firstName?: string;
  /** The saved last name, seeding the edit-name dialog. */
  lastName?: string;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  onEditProfilePicture?: () => void;
  /**
   * Saves the edited name. Resolve and the dialog closes; reject with an `Error` and it stays open
   * with that message in its banner. Omit it and the row renders without its action.
   */
  onSaveName?: (value: UserProfileEditNameValue) => Promise<void>;
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
  name,
  username,
  firstName,
  lastName,
  emails,
  phones,
  onEditProfilePicture,
  onSaveName,
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
  const updateUsername = onUsernameChange ? () => onUsernameChange(username) : undefined;

  return (
    <div {...stylex.props(styles.sections)}>
      <Section.Root aria-label='Account'>
        <Section.Title>Profile</Section.Title>
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
                <Section.Label>Profile picture</Section.Label>
                <Section.Description>Recommend size 1:1, up to 10MB.</Section.Description>
              </Section.Content>
              {onEditProfilePicture ? (
                <Section.Actions>
                  <Button
                    color='neutral'
                    size='sm'
                    variant='outline'
                    onClick={onEditProfilePicture}
                  >
                    Upload
                  </Button>
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Name</Section.Label>
                <Section.Description>{name}</Section.Description>
              </Section.Content>
              {onSaveName ? (
                <Section.Actions>
                  <EditName
                    firstName={firstName}
                    lastName={lastName}
                    onSave={onSaveName}
                  />
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          <Section.Row>
            <Section.Item>
              <Section.Content>
                <Section.Label>Username</Section.Label>
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
                    Edit username
                  </Button>
                </Section.Actions>
              ) : null}
            </Section.Item>
          </Section.Row>
          {!allowMultipleAccounts ? (
            <SingleContactRow
              items={emails}
              kind='email'
              label='Email'
              onAdd={onAddEmail}
              onManage={onManageEmail}
            />
          ) : null}
          {!allowMultipleAccounts ? (
            <SingleContactRow
              items={phones}
              kind='phone'
              label='Phone'
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
          label='Email'
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
          label='Phone'
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

/**
 * The name row's action. Split out so the section body stays a render, and so the controller is
 * mounted only where the action exists — the same shape as `UserProfileDeleteSectionView`.
 */
function EditName({
  firstName,
  lastName,
  onSave,
}: {
  firstName?: string;
  lastName?: string;
  onSave: (value: UserProfileEditNameValue) => Promise<void>;
}) {
  const controller = useUserProfileEditNameController({ firstName, lastName, onSave });

  return (
    <UserProfileEditNameView
      {...controller}
      open={controller.isOpen}
      trigger={
        <Button
          color='neutral'
          size='sm'
          variant='outline'
        >
          {m.editName.trigger}
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
  const emptyDescription = kind === 'email' ? 'No email addresses added' : 'No phone numbers added';
  const actionLabel = item
    ? kind === 'email'
      ? 'Update email'
      : 'Update phone number'
    : kind === 'email'
      ? 'Add email'
      : 'Add phone number';

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
          {item ? (
            <Section.Description {...stylex.props(styles.contactValue)}>
              <span>{item.value}</span>
              {item.isDefault ? <Badge color='neutral'>Primary</Badge> : null}
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
  const emptyDescription = kind === 'email' ? 'No email addresses added' : 'No phone numbers added';

  return (
    <Section.Row>
      <Section.Item>
        <Section.Content>
          <Section.Label>{label}</Section.Label>
        </Section.Content>
        {onAdd ? (
          <Section.Actions>
            <Button
              aria-label={kind === 'email' ? 'Add email' : 'Add phone number'}
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
              Add
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
              <Section.Item key={item.id}>
                <Section.Content>
                  <Section.Description {...stylex.props(styles.contactValue)}>
                    <span>{item.value}</span>
                    {item.isDefault ? <Badge color='neutral'>Primary</Badge> : null}
                  </Section.Description>
                </Section.Content>
                {actions.length > 0 ? (
                  <Section.Actions>
                    <UserProfileActionMenu
                      actions={actions}
                      label={`Manage ${item.value}`}
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
