import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { OrganizationProfileEditNameValue } from './organization-profile-edit-name.dialog';

interface OrganizationProfileEditNameControllerOptions {
  name: string;
  onSubmit: (name: string) => Promise<void>;
}

interface OrganizationProfileEditNameController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<OrganizationProfileEditNameValue>;
}

export function useOrganizationProfileEditNameController({
  name,
  onSubmit,
}: OrganizationProfileEditNameControllerOptions): OrganizationProfileEditNameController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { name },
    canSubmit: values => values.name !== name && values.name.trim() !== '',
    onSubmit: async values => {
      await onSubmit(values.name);
      setIsOpen(false);
    },
  });

  const onOpenChange = (open: boolean) => {
    if (!open && form.isSubmitting) {
      return;
    }
    form.reset();
    setIsOpen(open);
  };

  return { isOpen, onOpenChange, form };
}
