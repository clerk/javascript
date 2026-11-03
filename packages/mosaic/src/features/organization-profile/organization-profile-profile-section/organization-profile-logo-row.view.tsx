import { useState } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { Pen } from '../../../icons/glyphs/pen';
import { X } from '../../../icons/glyphs/x';
import type { LocalizableError } from '../../../localization';
import { useErrorText, useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';
import { AVATAR_REJECTION_ERRORS, AVATAR_UPLOAD } from '../../../utils/avatar-upload';
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
  const remove = logo.onRemove;
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
      disabled={logo.isPending}
      aria-busy={logo.isPending || undefined}
      {...AVATAR_UPLOAD}
      render={<Section.Row />}
      onReject={rejections => {
        const rejected = rejections[0];
        setRejection(rejected ? AVATAR_REJECTION_ERRORS[rejected.reason] : undefined);
        onReject?.(rejections);
      }}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          setRejection(undefined);
          void logo.onChange?.(file);
        }
      }}
    >
      <Section.Item>
        <Section.Media size='lg'>
          <Avatar.Root
            shape='square'
            size='fit'
          >
            <Avatar.Image
              alt={name}
              src={logo.previewUrl ?? imageUrl}
            />
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
        </Section.Media>
        <Section.Content>
          <Section.Label>{m.logo.label}</Section.Label>
          <Section.Description>{m.logo.description}</Section.Description>
        </Section.Content>
        <LogoActions
          canChange={Boolean(onChange)}
          hasImage={hasImage}
          onRemove={handleRemove}
        />
      </Section.Item>
      <Section.Error>{error}</Section.Error>
    </FileUpload.Root>
  );
}

function LogoActions({
  hasImage,
  canChange,
  onRemove,
}: {
  hasImage: boolean;
  canChange: boolean;
  onRemove?: () => Promise<unknown>;
}) {
  const m = useMessages('organizationProfile').profile;
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.logo.change, icon: Pen, onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.logo.remove, icon: X, onClick: () => void onRemove() });
  }

  if (actions.length > 0) {
    return (
      <Section.Actions>
        <ActionMenu
          actions={actions}
          label={m.logo.manage}
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
          {m.logo.upload}
        </FileUpload.Trigger>
      </Section.Actions>
    );
  }

  return null;
}
