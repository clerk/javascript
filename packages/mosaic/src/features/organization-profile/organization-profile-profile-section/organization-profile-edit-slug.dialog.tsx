import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { UseFormResult } from '../../../components/form';
import { Input } from '../../../components/input';
import { useMessages } from '../../../localization';

export interface OrganizationProfileEditSlugValue {
  slug: string;
}

export interface OrganizationProfileEditSlugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  form: UseFormResult<OrganizationProfileEditSlugValue>;
}

export function OrganizationProfileEditSlugDialog({
  open,
  onOpenChange,
  trigger,
  form,
}: OrganizationProfileEditSlugDialogProps) {
  const m = useMessages('organizationProfileProfileSection');
  const inputRef = useRef<HTMLInputElement>(null);
  const { feedback } = form.fields.slug;
  const { ref, ...control } = form.register('slug');
  const mergedRef = useMergeRefs([ref, inputRef]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Popup
        variant='card'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.slug.dialogTitle}</Card.Title>
            <Card.Description>{m.slug.dialogDescription}</Card.Description>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {form.error}
          </Card.Banner>
          <Card.Content
            render={
              <form
                id={form.id}
                onSubmit={form.handleSubmit}
              />
            }
          >
            <Field.Root
              disabled={form.isSubmitting}
              invalid={feedback?.type === 'error'}
            >
              <Field.Label visuallyHidden>{m.slug.fieldLabel}</Field.Label>
              <Input
                ref={mergedRef}
                {...control}
              />
              <Field.Feedback feedback={feedback} />
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                />
              }
            >
              {m.slug.cancel}
            </Dialog.Close>
            <SubmitButton
              form={form.id}
              fullWidth
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.slug.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
