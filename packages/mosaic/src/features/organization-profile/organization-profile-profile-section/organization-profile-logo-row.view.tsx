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
import { useOrganizationProfileLogoController } from './organization-profile-logo.controller';

const LOGO_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
const LOGO_MAX_BYTES = 10 * 1000 * 1000;

const REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};

export interface OrganizationProfileLogoRowViewProps {
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
  const m = useMessages('organizationProfileProfileSection');
  const errorText = useErrorText();
  const logo = useOrganizationProfileLogoController({ onChange, onRemove });
  const [rejection, setRejection] = useState<LocalizableError>();
  const error = rejection ?? logo.error;
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
      accept={LOGO_MIME_TYPES}
      maxSize={LOGO_MAX_BYTES}
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
      <Section.Error>{error ? errorText(error) : undefined}</Section.Error>
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
  onRemove?: () => Promise<void>;
}) {
  const m = useMessages('organizationProfileProfileSection');
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.logo.change, icon: 'pen', onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.logo.remove, icon: 'x', onClick: () => void onRemove() });
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
