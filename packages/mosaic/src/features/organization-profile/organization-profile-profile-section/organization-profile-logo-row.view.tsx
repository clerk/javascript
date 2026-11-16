import { useState } from 'react';

import { AvatarUpload } from '../../../blocks/avatar-upload';
import { Section } from '../../../components/section';
import type { LocalizableError } from '../../../localization';
import { useErrorText, useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { AVATAR_REJECTION_ERRORS } from '../../../utils/avatar-upload';
import { useOrganizationProfileLogoController } from './organization-profile-logo.controller';

interface OrganizationProfileLogoRowViewProps {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  onChange?: (file: File) => Promise<void>;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => Promise<void>;
}

export function OrganizationProfileLogoRowView({
  name,
  imageUrl,
  hasImage = false,
  onChange,
  onReject,
  onRemove,
}: OrganizationProfileLogoRowViewProps) {
  const m = useMessages('organizationProfile').profile;
  const errorText = useErrorText();
  const logo = useOrganizationProfileLogoController({ onChange, onRemove });
  const [rejection, setRejection] = useState<LocalizableError>();
  const error = rejection ? errorText(rejection) : logo.error;
  const change = logo.onChange;
  const remove = logo.onRemove;

  return (
    <AvatarUpload.Root
      name={name}
      imageUrl={logo.previewUrl ?? imageUrl}
      hasImage={hasImage}
      disabled={logo.isPending}
      aria-busy={logo.isPending || undefined}
      render={<Section.Row />}
      onChange={
        change
          ? file => {
              setRejection(undefined);
              void change(file);
            }
          : undefined
      }
      onReject={rejections => {
        const rejected = rejections[0];
        setRejection(rejected ? AVATAR_REJECTION_ERRORS[rejected.reason] : undefined);
        onReject?.(rejections);
      }}
      onRemove={
        remove
          ? () => {
              setRejection(undefined);
              void remove();
            }
          : undefined
      }
    >
      <AvatarUpload.Dropzone render={<Section.Item />}>
        <Section.Media size='lg'>
          <AvatarUpload.Image
            shape='square'
            size='fit'
          />
        </Section.Media>
        <Section.Content>
          <Section.Label>{m.logo.label}</Section.Label>
          <Section.Description>{m.logo.description}</Section.Description>
        </Section.Content>
        <AvatarUpload.Actions
          labels={m.logo}
          render={<Section.Actions />}
        />
      </AvatarUpload.Dropzone>
      <Section.Error>{error}</Section.Error>
      <AvatarUpload.Crop
        labels={m.logo.crop}
        shape='square'
      />
    </AvatarUpload.Root>
  );
}
