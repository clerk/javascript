import type { Ref } from 'react';
import { useId, useRef } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import type { DialogFocusTarget } from '../../components/dialog';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Flow, useFlowAutoFocus } from '../../components/flow';
import { Icon } from '../../components/icon';
import { Input } from '../../components/input';
import { InputGroup } from '../../components/input-group';
import { Select } from '../../components/select';
import { Text } from '../../components/text';
import { fill, useMessages } from '../../localization';
import { truncationStyles } from '../../utils/typography.styles';

const expirationValues = ['never', '1d', '7d', '30d', '60d', '90d', '180d', '1y'] as const;

export interface OrganizationProfileCreateAPIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: DialogFocusTarget;
  name: string;
  onNameChange: (name: string) => void;
  expiration: (typeof expirationValues)[number] | null;
  expirationDateLabel: string | null;
  onExpirationChange: (expiration: (typeof expirationValues)[number] | null) => void;
  secret: string | null;
  isPending: boolean;
  error: string | null;
  onSubmit: () => void | Promise<void>;
  onCopy: (close: boolean) => void | Promise<void>;
}

export function OrganizationProfileCreateAPIKeyDialog(props: OrganizationProfileCreateAPIKeyDialogProps) {
  const nameInput = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={open => {
        if (!props.isPending) {
          props.onOpenChange(open);
        }
      }}
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

function CreateKeyStep(props: OrganizationProfileCreateAPIKeyDialogProps & { inputRef: Ref<HTMLInputElement> }) {
  const m = useMessages('organizationProfileApiKeysPanel');
  const formId = useId();

  return (
    <>
      <Card.Header>
        <Card.Title>{m.createTitle}</Card.Title>
        <Card.Description>{m.createDescription}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={formId}
            onSubmit={event => {
              event.preventDefault();
              if (!props.isPending && props.name.trim() && props.expiration !== null) {
                void props.onSubmit();
              }
            }}
          />
        }
      >
        <Field.Root
          required
          disabled={props.isPending}
        >
          <Field.Label>{m.nameLabel}</Field.Label>
          <Input
            ref={props.inputRef}
            name='name'
            autoComplete='off'
            value={props.name}
            onChange={event => props.onNameChange(event.target.value)}
          />
        </Field.Root>
        <Field.Root
          required
          disabled={props.isPending}
        >
          <Field.Label>{m.expirationLabel}</Field.Label>
          <Select.Root
            items={expirationValues.map(value => ({ value, label: m.expirationOptions[value] }))}
            value={props.expiration ?? undefined}
            onValueChange={value => props.onExpirationChange(expirationValues.find(option => option === value) ?? null)}
          >
            <Select.Trigger placeholder={m.expirationPlaceholder} />
            <Select.Popup />
          </Select.Root>
          {props.expiration !== null ? (
            <Field.Description>
              {props.expirationDateLabel
                ? fill(m.expirationCaption, { date: props.expirationDateLabel })
                : m.noExpiration}
            </Field.Description>
          ) : null}
        </Field.Root>

        {props.error ? (
          <Text
            role='alert'
            color='negative'
          >
            {props.error}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={props.isPending}
          disabled={!props.name.trim() || props.expiration === null}
        >
          {m.add}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function CopyKeyStep(props: OrganizationProfileCreateAPIKeyDialogProps) {
  const m = useMessages('organizationProfileApiKeysPanel');
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
              if (!props.isPending) {
                void props.onCopy(true);
              }
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
              <Button
                ref={useFlowAutoFocus<HTMLButtonElement>()}
                type='button'
                aria-label={m.copy}
                disabled={props.isPending}
                onClick={() => void props.onCopy(false)}
              >
                <Icon name='clipboard' />
              </Button>
            </InputGroup.End>
          </InputGroup.Root>
        </Field.Root>

        {props.error ? (
          <Text
            role='alert'
            color='negative'
          >
            {props.error}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={props.isPending}
        >
          {m.copyAndClose}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
