import { useState } from 'react';

import { usePendingAction } from '../../../hooks/use-pending-action';
import { FileUpload } from '../../../primitives/file-upload';

export interface UserProfilePictureControllerOptions {
  onChange?: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export interface UserProfilePictureController {
  onChange?: (file: File) => void;
  onRemove?: () => void;
  isPending: boolean;
  previewUrl: string | undefined;
  error: string | undefined;
}

export function useUserProfilePictureController({
  onChange,
  onRemove,
}: UserProfilePictureControllerOptions): UserProfilePictureController {
  const [picked, setPicked] = useState<File>();
  const upload = usePendingAction();
  const previewUrl = FileUpload.useObjectUrl(upload.error ? undefined : picked);

  const save = (next: File | undefined, action: () => Promise<void>) =>
    upload.run('picture', async () => {
      setPicked(next);
      await action();
    });

  return {
    onChange: onChange ? file => void save(file, () => onChange(file)) : undefined,
    onRemove: onRemove ? () => void save(undefined, onRemove) : undefined,
    isPending: upload.isPending,
    previewUrl,
    error: upload.error,
  };
}
