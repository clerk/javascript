import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';
import { useId, useRef } from 'react';

import { SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { CopyButton } from '../../components/copy-button';
import type { DialogFocusTarget } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import type { UseFormResult } from '../../components/form';
import { Input } from '../../components/input';
import { InputGroup } from '../../components/input-group';
import { Select } from '../../components/select';
import { Text } from '../../components/text';
import { fill, useMessages } from '../../localization';
import { truncationStyles } from '../../styles/typography.styles';

const expirationValues = ['never', '1d', '7d', '30d', '60d', '90d', '180d', '1y'] as const;

export type UserProfileAPIKeyExpiration = (typeof expirationValues)[number];

export interface UserProfileCreateAPIKeyValues {
  name: string;
  expiration: UserProfileAPIKeyExpiration | null;
}

export interface UserProfileCreateAPIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  form: UseFormResult<UserProfileCreateAPIKeyValues>;
  expirationDateLabel: string | null;
  secret: string | null;
  copyError: string | null;
  onCopy: (close: boolean) => void | Promise<void>;
}

export function UserProfileCreateAPIKeyDialog(props: UserProfileCreateAPIKeyDialogProps) {
  const nameInput = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      role={props.secret ? 'alertdialog' : 'dialog'}
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <Dialog.Popup
        initialFocus={props.secret ? undefined : nameInput}
        finalFocus={props.finalFocus}
      >
        <Card.Root
          elevation='overlay'
          renderBranding={false}
        >
          <Flow.Root
            value={props.secret ? 'copy' : 'create'}
            state={props}
          >
            {current => (
              <>
                <Flow.Step ids={['create']}>
                  <CreateKeyStep
                    {...current}
                    inputRef={nameInput}
                  />
                </Flow.Step>
                <Flow.Step ids={['copy']}>
                  <CopyKeyStep {...current} />
                </Flow.Step>
              </>
            )}
          </Flow.Root>
        </Card.Root>
      </Dialog.Popup>
    </Dialog.Root>
  );
}

function CreateKeyStep(props: UserProfileCreateAPIKeyDialogProps & { inputRef: Ref<HTMLInputElement> }) {
  const m = useMessages('userProfileApiKeysPanel');
  const { form } = props;
  const { ref, ...nameControl } = form.register('name');
  const nameRef = useMergeRefs([ref, props.inputRef]);
  const { expiration } = form.values;

  return (
    <>
      <Card.Header>
        <Card.Title>{m.createTitle}</Card.Title>
        <Card.Description>{m.createDescription}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={form.id}
            onSubmit={form.handleSubmit}
          />
        }
      >
        <Field.Root
          required
          disabled={form.isSubmitting}
        >
          <Field.Label>{m.nameLabel}</Field.Label>
          <Input
            ref={nameRef}
            autoComplete='off'
            {...nameControl}
          />
        </Field.Root>
        <Field.Root
          required
          disabled={form.isSubmitting}
        >
          <Field.Label>{m.expirationLabel}</Field.Label>
          <Select.Root
            items={expirationValues.map(value => ({ value, label: m.expirationOptions[value] }))}
            value={expiration ?? undefined}
            onValueChange={value =>
              form.setValue('expiration', expirationValues.find(option => option === value) ?? null)
            }
          >
            <Select.Trigger placeholder={m.expirationPlaceholder} />
            <Select.Popup />
          </Select.Root>
          {expiration !== null ? (
            <Field.Description>
              {props.expirationDateLabel
                ? fill(m.expirationCaption, { date: props.expirationDateLabel })
                : m.noExpiration}
            </Field.Description>
          ) : null}
        </Field.Root>

        {form.error ? (
          <Text
            role='alert'
            color='negative'
          >
            {form.error}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={form.id}
          fullWidth
          isPending={form.isSubmitting}
          disabled={!form.canSubmit}
        >
          {m.add}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function CopyKeyStep(props: UserProfileCreateAPIKeyDialogProps) {
  const m = useMessages('userProfileApiKeysPanel');
  const formId = useId();

  return (
    <>
      <Card.Header>
        <Card.Title>{m.copyTitle}</Card.Title>
        <Card.Description>{m.copyDescription}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={formId}
            onSubmit={event => {
              event.preventDefault();
              void props.onCopy(true);
            }}
          />
        }
      >
        <Field.Root>
          <Field.Label>{m.secretLabel}</Field.Label>
          <InputGroup.Root>
            <InputGroup.Input
              value={props.secret ?? ''}
              readOnly
              xstyle={truncationStyles.singleLine}
            />
            <InputGroup.End>
              <CopyButton
                ref={useFlowAutoFocus<HTMLButtonElement>()}
                value={props.secret ?? ''}
                label={m.copy}
                copiedLabel={m.copied}
                onCopy={() => props.onCopy(false)}
              />
            </InputGroup.End>
          </InputGroup.Root>
        </Field.Root>

        {props.copyError ? (
          <Text
            role='alert'
            color='negative'
          >
            {props.copyError}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={formId}
          fullWidth
        >
          {m.copyAndClose}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
