import type { FileRejection } from '@clerk/headless/file-upload';
import * as stylex from '@stylexjs/stylex';

import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Icon } from '../../components/icon';
import { Section } from '../../components/section';
import type { UserProfileMenuAction } from '../user-profile-action-menu';
import { UserProfileActionMenu } from '../user-profile-action-menu';
import { fill, userProfileAccountSectionBase as m } from './user-profile-account-section.messages';
import { styles } from './user-profile-account-section.styles';
import type { UserProfileNameAttribute } from './user-profile-account-section.types';
import type { UserProfileEditNameValue } from './user-profile-edit-name.dialog';
import { UserProfileNameRowView } from './user-profile-name-row.view';
import { UserProfilePictureRowView } from './user-profile-picture-row.view';
import { UserProfileUsernameRowView } from './user-profile-username-row.view';

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
  firstNameAttribute?: UserProfileNameAttribute;
  lastNameAttribute?: UserProfileNameAttribute;
  emails: UserProfileEmail[];
  phones: UserProfilePhone[];
  onProfilePictureChange?: (file: File) => void;
  onProfilePictureReject?: (rejections: FileRejection[]) => void;
  onRemoveProfilePicture?: () => void;
  onSubmitName?: (value: UserProfileEditNameValue) => Promise<void>;
  onSubmitUsername?: (username: string) => Promise<void>;
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
  onSubmitUsername,
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
  return (
    <div {...stylex.props(styles.sections)}>
      <Section.Root aria-label={m.sectionLabel}>
        <Section.Title>{m.sectionTitle}</Section.Title>
        <Section.Group>
          <UserProfilePictureRowView
            name={name}
            imageUrl={imageUrl}
            hasImage={hasImage}
            onChange={onProfilePictureChange}
            onReject={onProfilePictureReject}
            onRemove={onRemoveProfilePicture}
          />
          <UserProfileNameRowView
            name={name}
            firstName={firstName}
            lastName={lastName}
            firstNameAttribute={firstNameAttribute}
            lastNameAttribute={lastNameAttribute}
            onSubmit={onSubmitName}
          />
          <UserProfileUsernameRowView
            username={username}
            onSubmit={onSubmitUsername}
          />
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
            <Section.Description xstyle={styles.contactValue}>
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
                  <Section.Description xstyle={styles.contactValue}>
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
