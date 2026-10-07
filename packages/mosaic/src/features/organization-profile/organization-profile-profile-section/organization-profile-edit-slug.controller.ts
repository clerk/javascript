import { useState } from 'react';

import { useForm } from '../../../components/form';

export function useOrganizationProfileEditSlugController(slug: string, onSubmit: (slug: string) => Promise<void>) {
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
