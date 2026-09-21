import { useState } from 'react';

import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';

const LOGO_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
const LOGO_MAX_BYTES = 10 * 1000 * 1000;

export interface OrganizationProfileLogoRowViewProps {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  errorMessage?: string;
  onChange?: (file: File) => void;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => void;
}

export function OrganizationProfileLogoRowView({
  name,
  imageUrl,
  hasImage = false,
  errorMessage,
  onChange,
  onReject,
  onRemove,
}: OrganizationProfileLogoRowViewProps) {
  const m = useMessages('organizationProfileWorkspaceSection');
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
      accept={LOGO_MIME_TYPES}
      maxSize={LOGO_MAX_BYTES}
      render={<Section.Row />}
      onReject={rejections => {
        const rejection = rejections[0];
        setRejectionError(rejection ? m.logo.errors[rejection.reason] : undefined);
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
          <Avatar.Root
            shape='square'
            size='fit'
          >
            <Avatar.Image
              alt={name}
              src={imageUrl}
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
          onRemove={onRemove}
        />
      </Section.Item>
      <Section.Error>{displayedError}</Section.Error>
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
  onRemove?: () => void;
}) {
  const m = useMessages('organizationProfileWorkspaceSection');
  const { openFilePicker } = FileUpload.useFileUpload();
  const actions: ActionMenuAction[] = [];

  if (hasImage && canChange) {
    actions.push({ label: m.logo.change, icon: 'pen', onClick: openFilePicker });
  }

  if (hasImage && onRemove) {
    actions.push({ label: m.logo.remove, icon: 'x', onClick: onRemove });
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
