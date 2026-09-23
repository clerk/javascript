import { useState } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import type { LocalizableError } from '../../../localization';
import { useErrorText, useMessages } from '../../../localization';
import type { FileRejection, FileRejectionReason } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';
import { useUserProfilePictureController } from './user-profile-picture.controller';

const PROFILE_PICTURE_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
/** Matches the limit the row's own description advertises. */
const PROFILE_PICTURE_MAX_BYTES = 10 * 1000 * 1000;

/** Rejecting a pick locally reads the same as the server rejecting the upload. */
const REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};

export interface UserProfilePictureRowViewProps {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  onChange?: (file: File) => Promise<void>;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => Promise<void>;
}

export function UserProfilePictureRowView({
  name,
  imageUrl,
  hasImage = false,
  onChange,
  onReject,
  onRemove,
}: UserProfilePictureRowViewProps) {
  const m = useMessages('userProfileAccountSection');
  const errorText = useErrorText();
  const controller = useUserProfilePictureController({ onChange, onRemove });
  const [rejection, setRejection] = useState<LocalizableError>();
  const error = rejection ?? controller.error;
  const remove = controller.onRemove;
  const handleRemove = remove
    ? () => {
        setRejection(undefined);
        return remove();
      }
    : undefined;
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
      disabled={controller.isPending}
      aria-busy={controller.isPending || undefined}
      render={<Section.Row />}
      onReject={rejections => {
        const rejected = rejections[0];
        setRejection(rejected ? REJECTION_ERRORS[rejected.reason] : undefined);
        onReject?.(rejections);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          setRejection(undefined);
          void controller.onChange?.(file);
        }
      }}
    >
      <Section.Item>
        <Section.Media size='lg'>
          <Avatar.Root size='fit'>
            <Avatar.Image
              alt={name}
              src={controller.previewUrl ?? imageUrl}
            />
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
        </Section.Media>
        <Section.Content>
          <Section.Label>{m.picture.label}</Section.Label>
          <Section.Description>{m.picture.description}</Section.Description>
        </Section.Content>
        <ProfilePictureActions
          canChange={Boolean(controller.onChange)}
          hasImage={hasImage}
          onRemove={handleRemove}
        />
      </Section.Item>
      <Section.Error>{error ? errorText(error) : undefined}</Section.Error>
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
  onRemove?: () => Promise<void>;
}) {
  const m = useMessages('userProfileAccountSection');
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.picture.change, icon: 'pen', onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.picture.remove, icon: 'x', onClick: () => void onRemove() });
  }

  if (actions.length > 0) {
    return (
      <Section.Actions>
        <ActionMenu
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
