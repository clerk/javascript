import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import type { LocalizableError } from '../../../localization';
import { useErrorText } from '../../../localization';
import type { FileRejection, FileRejectionReason } from '../../../primitives/file-upload';
import { FileUpload } from '../../../primitives/file-upload';

/** Rejecting a pick locally reads the same as the server rejecting the upload. */
const REJECTION_ERRORS: Record<FileRejectionReason, LocalizableError> = {
  accept: { code: 'avatar_file_type_invalid' },
  size: { code: 'avatar_file_size_exceeded' },
  overflow: { code: 'avatar_file_count_exceeded' },
};

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export interface UserProfilePictureController {
  onChange?: (file: File) => void;
  onReject: (rejections: FileRejection[]) => void;
  onRemove?: () => void;
  isPending: boolean;
  previewUrl: string | undefined;
  error: string | undefined;
}

export function useUserProfilePictureController({
  onChange,
  onRemove,
}: UserProfilePictureControllerOptions): UserProfilePictureController {
  const errorText = useErrorText();
  const [picked, setPicked] = useState<File>();
  const [rejection, setRejection] = useState<LocalizableError>();
  const upload = usePendingAction();
  const previewUrl = FileUpload.useObjectUrl(upload.error ? undefined : picked);

  const save = (next: File | undefined, action: () => Promise<void>) => {
    setRejection(undefined);
    return upload.run('picture', async () => {
      setPicked(next);
      await action();
    });
  };

  return {
    onChange: onChange ? file => void save(file, () => onChange(file)) : undefined,
    onReject: rejections => {
      const rejected = rejections[0];
      setRejection(rejected ? REJECTION_ERRORS[rejected.reason] : undefined);
    },
    onRemove: onRemove ? () => void save(undefined, onRemove) : undefined,
    isPending: upload.isPending,
    previewUrl,
    error: rejection ? errorText(rejection) : upload.error,
  };
}
