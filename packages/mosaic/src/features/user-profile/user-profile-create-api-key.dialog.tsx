import * as stylex from '@stylexjs/stylex';
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
import { styles } from './user-profile-api-keys-panel.styles';

const expirationValues = ['never', '1d', '7d', '30d', '60d', '90d', '180d', '1y'] as const;

export interface UserProfileCreateAPIKeyDialogProps {
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

export function UserProfileCreateAPIKeyDialog(props: UserProfileCreateAPIKeyDialogProps) {
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

function CreateKeyStep(props: UserProfileCreateAPIKeyDialogProps & { inputRef: Ref<HTMLInputElement> }) {
  const m = useMessages('userProfileApiKeysPanel');
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
              if (!props.isPending) {
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
        <Field.Root disabled={props.isPending}>
          <div {...stylex.props(styles.expirationLabel)}>
            <Field.Label>{m.expirationLabel}</Field.Label>
            <Text color='foreground-secondary'>{m.optional}</Text>
          </div>
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
          disabled={!props.name.trim()}
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
              ref={useFlowAutoFocus<HTMLInputElement>()}
              value={props.secret ?? ''}
              readOnly
            />
            <InputGroup.End>
              <Button
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
