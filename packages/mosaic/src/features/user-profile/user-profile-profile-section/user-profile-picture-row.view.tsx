import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { FileUpload } from '../../../primitives/file-upload';
import { AVATAR_UPLOAD } from '../../../utils/avatar-upload';
import type { UserProfilePictureController } from './user-profile-picture.controller';

export interface UserProfilePictureRowViewProps extends UserProfilePictureController {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
}

export function UserProfilePictureRowView({
  name,
  imageUrl,
  hasImage = false,
  previewUrl,
  isPending,
  error,
  onChange,
  onReject,
  onRemove,
}: UserProfilePictureRowViewProps) {
  const m = useMessages('userProfile').profile;
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FileUpload.Root
      {...AVATAR_UPLOAD}
      disabled={isPending}
      aria-busy={isPending || undefined}
      render={<Section.Row />}
      onReject={onReject}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          onChange?.(file);
        }
      }}
    >
      <Section.Item>
        <Section.Media size='lg'>
          <Avatar.Root size='fit'>
            <Avatar.Image
              alt={name}
              src={previewUrl ?? imageUrl}
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
      <Section.Error>{error}</Section.Error>
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
  const m = useMessages('userProfile').profile;
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.picture.change, onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.picture.remove, color: 'negative', onClick: onRemove });
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
