import { AvatarUpload } from '../../../blocks/avatar-upload';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
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

  return (
    <AvatarUpload.Root
      name={name}
      imageUrl={previewUrl ?? imageUrl}
      hasImage={hasImage}
      disabled={isPending}
      aria-busy={isPending || undefined}
      render={<Section.Row />}
      onChange={onChange}
      onReject={onReject}
      onRemove={onRemove}
    >
      <AvatarUpload.Dropzone render={<Section.Item />}>
        <Section.Media size='lg'>
          <AvatarUpload.Image size='fit' />
        </Section.Media>
        <Section.Content>
          <Section.Label>{m.picture.label}</Section.Label>
          <Section.Description>{m.picture.description}</Section.Description>
        </Section.Content>
        <AvatarUpload.Actions
          labels={m.picture}
          render={<Section.Actions />}
        />
      </AvatarUpload.Dropzone>
      <Section.Error>{error}</Section.Error>
    </AvatarUpload.Root>
  );
}
