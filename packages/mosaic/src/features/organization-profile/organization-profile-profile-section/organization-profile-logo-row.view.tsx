import type { ActionMenuAction } from '../../../components/action-menu';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { FileRejection } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';
import { useOrganizationProfileLogoController } from './organization-profile-logo.controller';

const LOGO_MIME_TYPES = 'image/png,image/jpeg,image/gif,image/webp';
const LOGO_MAX_BYTES = 10 * 1000 * 1000;

export interface OrganizationProfileLogoRowViewProps {
  name: string;
  imageUrl?: string;
  hasImage?: boolean;
  errorMessage?: string;
  onChange?: (file: File) => void | Promise<void>;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => void | Promise<void>;
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
  const m = useMessages('organizationProfileProfileSection');
  const logo = useOrganizationProfileLogoController({ onChange, onReject, onRemove });
  const initials = name
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <FileUpload.Root
      disabled={logo.isPending || !onChange}
      accept={LOGO_MIME_TYPES}
      maxSize={LOGO_MAX_BYTES}
      render={<Section.Row />}
      onReject={logo.onReject}
      onValueChange={files => {
        const file = files[0];
        if (file) {
          logo.onChange(file);
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
          hasImage={hasImage || Boolean(logo.previewUrl)}
          isPending={logo.isPending}
          onRemove={logo.onRemove}
        />
      </Section.Item>
      <Section.Error>{logo.errorMessage ?? errorMessage}</Section.Error>
    </FileUpload.Root>
  );
}

function LogoActions({
  hasImage,
  canChange,
  isPending,
  onRemove,
}: {
  hasImage: boolean;
  canChange: boolean;
  isPending: boolean;
  onRemove?: () => void;
}) {
  const m = useMessages('organizationProfileProfileSection');
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
          disabled={isPending}
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
