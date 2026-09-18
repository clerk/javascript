import { useState } from 'react';

import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';
import type { UserProfileMenuAction } from '../user-profile-action-menu';
import { UserProfileActionMenu } from '../user-profile-action-menu';

const PROFILE_PICTURE_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
/** Matches the limit the row's own description advertises. */
const PROFILE_PICTURE_MAX_BYTES = 10 * 1000 * 1000;

export interface UserProfilePictureRowViewProps {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  errorMessage?: string;
  onChange?: (file: File) => void;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => void;
}

export function UserProfilePictureRowView({
  name,
  imageUrl,
  hasImage = false,
  errorMessage,
  onChange,
  onReject,
  onRemove,
}: UserProfilePictureRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const [rejectionError, setRejectionError] = useState<string>();
  const displayedError = errorMessage ?? rejectionError;
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FileUpload.Root
      accept={PROFILE_PICTURE_MIME_TYPES}
      maxSize={PROFILE_PICTURE_MAX_BYTES}
      render={<Section.Row />}
      onReject={rejections => {
        const rejection = rejections[0];
        setRejectionError(rejection ? m.picture.errors[rejection.reason] : undefined);
        onReject?.(rejections);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          setRejectionError(undefined);
          onChange?.(file);
        }
      }}
    >
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
          canChange={Boolean(onChange)}
          hasImage={hasImage}
          onRemove={onRemove}
        />
      </Section.Item>
      {displayedError ? <Section.Error>{displayedError}</Section.Error> : null}
    </FileUpload.Root>
  );
}

function ProfilePictureActions({
  hasImage,
  canChange,
  onRemove,
}: {
  hasImage: boolean;
  canChange: boolean;
  onRemove?: () => void;
}) {
  const m = useMessages('userProfileAccountSection');
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
