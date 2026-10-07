import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import type { LocalizableError } from '../../../localization';
import { useErrorText } from '../../../localization';
import type { FileRejection, FileRejectionReason } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';

export interface OrganizationProfileLogoControllerOptions {
  onChange?: (file: File) => void | Promise<void>;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: () => void | Promise<void>;
}

const REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};

export function useOrganizationProfileLogoController({
  onChange,
  onReject,
  onRemove,
}: OrganizationProfileLogoControllerOptions) {
  const errorText = useErrorText();
  const [rejectionError, setRejectionError] = useState<LocalizableError>();
  const [preview, setPreview] = useState<File>();
  const previewUrl = FileUpload.useObjectUrl(preview);
  const action = usePendingAction<'change' | 'remove'>();

  return {
    previewUrl,
    isPending: action.isPending,
    errorMessage: rejectionError ? errorText(rejectionError) : action.error,
    onReject: (rejections: FileRejection[]) => {
      const rejection = rejections[0];
      setRejectionError(rejection ? REJECTION_ERRORS[rejection.reason] : undefined);
      action.reset();
      onReject?.(rejections);
    },
    onChange: (file: File) => {
      if (!onChange || action.busy()) {
        return;
      }
      setRejectionError(undefined);
      setPreview(file);
      void action
        .run('change', () => onChange(file))
        .then(success => {
          if (!success) {
            setPreview(undefined);
          }
        });
    },
    onRemove: onRemove
      ? () => {
          setRejectionError(undefined);
          void action.run('remove', onRemove).then(success => {
            if (success) {
              setPreview(undefined);
            }
          });
        }
      : undefined,
  };
}
