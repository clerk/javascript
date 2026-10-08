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

export interface OrganizationProfileEditNameValue {
  name: string;
}

export interface OrganizationProfileEditNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  form: UseFormResult<OrganizationProfileEditNameValue>;
}

export function OrganizationProfileEditNameDialog({
  open,
  onOpenChange,
  trigger,
  form,
}: OrganizationProfileEditNameDialogProps) {
  const m = useMessages('organizationProfileProfileSection');
  const inputRef = useRef<HTMLInputElement>(null);
  const { feedback } = form.fields.name;
  const { ref, ...control } = form.register('name');
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
            <Card.Title>{m.name.dialogTitle}</Card.Title>
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
              <Field.Label visuallyHidden>{m.name.fieldLabel}</Field.Label>
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
              {m.name.cancel}
            </Dialog.Close>
            <SubmitButton
              form={form.id}
              fullWidth
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.name.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
