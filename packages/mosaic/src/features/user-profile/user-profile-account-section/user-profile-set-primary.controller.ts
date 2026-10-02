import { useForm } from '../../../components/form';
import type { UserProfileContact } from './user-profile-account-section.types';

export interface UserProfileSetPrimaryControllerOptions {
  items: UserProfileContact[];
  onSetPrimary?: (id: string) => void | Promise<void>;
}

export interface UserProfileSetPrimaryController {
  onSetPrimary: ((id: string) => void) | undefined;
  error: string | undefined;
}

export function useUserProfileSetPrimaryController({
  items,
  onSetPrimary,
}: UserProfileSetPrimaryControllerOptions): UserProfileSetPrimaryController {
  const form = useForm({
    initialValues: { id: '' },
    canSubmit: ({ id }) => {
      const item = items.find(item => item.id === id);
      return item?.isVerified === true && !item.isDefault;
    },
    onSubmit: async ({ id }) => {
      await onSetPrimary?.(id);
    },
  });

  return {
    onSetPrimary:
      onSetPrimary && !form.isSubmitting
        ? id => {
            form.setValue('id', id);
            form.submit();
          }
        : undefined,
    error: form.error,
  };
}
