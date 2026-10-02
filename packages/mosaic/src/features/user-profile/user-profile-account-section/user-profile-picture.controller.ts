import { useForm } from '../../../components/form';
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
  const form = useForm<{ file: File | undefined }>({
    initialValues: { file: undefined },
    onSubmit: async ({ file }) => {
      if (file) {
        await onChange?.(file);
      } else {
        await onRemove?.();
      }
    },
  });
  const previewUrl = FileUpload.useObjectUrl(form.error ? undefined : form.values.file);
  const picked = (file: File | undefined) => {
    form.setValue('file', file);
    form.submit();
  };

  return {
    onChange: onChange ? picked : undefined,
    onRemove: onRemove ? () => picked(undefined) : undefined,
    isPending: form.isSubmitting,
    previewUrl,
    error: form.error,
  };
}
