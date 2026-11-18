import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Input } from '../../../components/input';
import { useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import type { SSORenameController } from './sso-connection.controller';

export interface SSORenameDialogProps extends SSORenameController {
  trigger: DialogTriggerProps['render'];
}

export function SSORenameDialog({ isOpen, onOpenChange, form, trigger }: SSORenameDialogProps) {
  const m = useMessages('organizationProfile').security.ssoConnection.name;
  const inputRef = useRef<HTMLInputElement>(null);
  const { feedback } = form.fields.name;
  const { ref, ...control } = form.register('name');
  const mergedRef = useMergeRefs([ref, inputRef]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Trigger render={trigger} />
      <Dialog.Popup
        variant='card'
        initialFocus={inputRef}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Card.Header>
            <Card.Title>{m.dialogTitle}</Card.Title>
          </Card.Header>
          <Card.Banner
            role='alert'
            color='negative'
          >
            {form.error}
          </Card.Banner>
          <Card.Content
            render={
              <Form
                id={form.id}
                onSubmit={form.handleSubmit}
              />
            }
          >
            <Field.Root
              disabled={form.isSubmitting}
              focusableWhenDisabled
              invalid={feedback?.type === 'error'}
            >
              <Field.Label>{m.fieldLabel}</Field.Label>
              <Input
                ref={mergedRef}
                data-1p-ignore
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
                />
              }
            >
              {m.cancel}
            </Dialog.Close>
            <SubmitButton
              form={form.id}
              isPending={form.isSubmitting}
              disabled={!form.canSubmit}
              focusableWhenDisabled
            >
              {m.save}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
