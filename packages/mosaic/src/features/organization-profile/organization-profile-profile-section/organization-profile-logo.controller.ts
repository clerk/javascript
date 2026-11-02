import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { FileUpload } from '../../../primitives/file-upload';

interface OrganizationProfileLogoControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

interface OrganizationProfileLogoController {
  onChange?: (file: File) => Promise<boolean>;
  onRemove?: () => Promise<boolean>;
  isPending: boolean;
  previewUrl: string | undefined;
  error: string | undefined;
}

export function useOrganizationProfileLogoController({
  onChange,
  onRemove,
}: OrganizationProfileLogoControllerOptions): OrganizationProfileLogoController {
  const actions = usePendingAction<'change' | 'remove'>();
  const [preview, setPreview] = useState<File>();
  const previewUrl = FileUpload.useObjectUrl(preview);

  return {
    onChange: onChange
      ? async file => {
          const changed = await actions.run('change', () => {
            setPreview(file);
            return onChange(file);
          });
          if (!changed) {
            setPreview(current => (current === file ? undefined : current));
          }
          return changed;
        }
      : undefined,
    onRemove: onRemove
      ? () =>
          actions.run('remove', async () => {
            await onRemove();
            setPreview(undefined);
          })
      : undefined,
    isPending: actions.isPending,
    previewUrl,
    error: actions.error,
  };
}
