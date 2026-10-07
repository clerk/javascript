import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import type { DialogTriggerProps } from '../../../components/dialog';
import { Dialog } from '../../../components/dialog';
import { Field } from '../../../components/field';
import type { FieldFeedback } from '../../../components/form/form-submit-error';
import { Input } from '../../../components/input';

export interface OrganizationProfileEditFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: DialogTriggerProps['render'];
  title: string;
  description?: string;
  fieldLabel: string;
  cancelLabel: string;
  saveLabel: string;
  formId: string;
  onSubmit: (event: { preventDefault: () => void }) => void;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  onBlur: () => void;
  fieldRef: (element: HTMLElement | null) => void;
  feedback?: FieldFeedback;
  error?: string;
  canSave: boolean;
  isSaving: boolean;
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
  formId,
  onSubmit,
  value,
  onChange,
  onBlur,
  fieldRef,
  feedback,
  error,
  canSave,
  isSaving,
}: OrganizationProfileEditFieldDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs([fieldRef, inputRef]);

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
          <Card.Banner
            role='alert'
            color='negative'
          >
            {error}
          </Card.Banner>
          <Card.Content
            render={
              <form
                id={formId}
                onSubmit={onSubmit}
              />
            }
          >
            <Field.Root
              disabled={isSaving}
              invalid={feedback?.type === 'error'}
            >
              <Field.Label visuallyHidden>{fieldLabel}</Field.Label>
              <Input
                ref={mergedRef}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
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
              {cancelLabel}
            </Dialog.Close>
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
