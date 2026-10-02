import { useState } from 'react';

import type { UseFormResult } from '../../components/form';
import { useForm } from '../../components/form';
import type {
  UserProfilePasskeyNameValidator,
  UserProfileRenamePasskeyValues,
} from './user-profile-passkeys-section/user-profile-passkeys-section.types';

interface UserProfileRenamePasskeyControllerOptions {
  id: string;
  name: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  validateName?: UserProfilePasskeyNameValidator;
}

interface UserProfileRenamePasskeyController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<UserProfileRenamePasskeyValues>;
}

export function useUserProfileRenamePasskeyController({
  id,
  name,
  onRename,
  validateName,
}: UserProfileRenamePasskeyControllerOptions): UserProfileRenamePasskeyController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { name },
    fields: { name: { validate: validateName } },
    canSubmit: values => Boolean(onRename) && values.name.length > 1 && values.name !== name,
    onSubmit: async values => {
      await onRename?.(id, values.name);
      setIsOpen(false);
    },
  });

  const onOpenChange = (open: boolean) => {
    if (form.isSubmitting) {
      return;
    }
    form.reset({ name });
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form };
}
