import type { FormEvent } from 'react';
import { useId, useRef } from 'react';

import { Banner } from '../../../components/banner';
import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import { Input } from '../../../components/input';
import type { OrganizationProfileFormError } from '../organization-profile.types';

export interface OrganizationProfileEditFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  title: string;
  description?: string;
  fieldLabel: string;
  cancelLabel: string;
  saveLabel: string;
  value: string;
  onValueChange: (value: string) => void;
  canSave?: boolean;
  isSaving?: boolean;
  error?: OrganizationProfileFormError;
  onSubmit: () => void;
}

export function OrganizationProfileEditFieldDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  fieldLabel,
  cancelLabel,
  saveLabel,
  value,
  onValueChange,
  canSave = true,
  isSaving = false,
  error,
  onSubmit,
}: OrganizationProfileEditFieldDialogProps) {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSave && !isSaving) {
      onSubmit();
    }
  };

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
            <Card.Title>{title}</Card.Title>
            {description ? <Card.Description>{description}</Card.Description> : null}
          </Card.Header>

          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={handleSubmit}
              />
            }
          >
            {error?.message ? (
              <Banner.Root
                role='alert'
                color='negative'
              >
                <Banner.Label>{error.message}</Banner.Label>
              </Banner.Root>
            ) : null}
            <Field.Root invalid={Boolean(error?.field)}>
              <Field.Label visuallyHidden>{fieldLabel}</Field.Label>
              <Input
                ref={inputRef}
                disabled={isSaving}
                value={value}
                onChange={event => onValueChange(event.target.value)}
              />
              <Field.Message>
                <Field.Error>{error?.field}</Field.Error>
              </Field.Message>
            </Field.Root>
          </Card.Content>
          <Card.Footer>
            <Dialog.Close
              render={
                <Button
                  variant='outline'
                  color='neutral'
                  fullWidth
                >
                  {cancelLabel}
                </Button>
              }
            />
            <SubmitButton
              form={formId}
              fullWidth
              isPending={isSaving}
              disabled={!canSave}
              focusableWhenDisabled
            >
              {saveLabel}
            </SubmitButton>
          </Card.Footer>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
