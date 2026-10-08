import { useState } from 'react';

import type { UseFormResult } from '../../../components/form';
import { useForm } from '../../../components/form';
import type { OrganizationProfileEditSlugValue } from './organization-profile-edit-slug.dialog';

export interface OrganizationProfileEditSlugControllerOptions {
  slug: string;
  onSubmit: (slug: string) => Promise<void>;
}

export interface OrganizationProfileEditSlugController {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormResult<OrganizationProfileEditSlugValue>;
}

export function useOrganizationProfileEditSlugController({
  slug,
  onSubmit,
}: OrganizationProfileEditSlugControllerOptions): OrganizationProfileEditSlugController {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    initialValues: { slug },
    canSubmit: values => values.slug !== slug,
    onSubmit: async values => {
      await onSubmit(values.slug);
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
