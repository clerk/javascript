import { stringToFormattedPhoneString } from '@clerk/shared/phone';
import { useMergeRefs } from '@floating-ui/react';
import type { Ref } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Flow, type FlowDirection, useFlowAutoFocus } from '../../components/flow';
import { Select } from '../../components/select';
import { useMessages } from '../../localization';
import { EnterPhoneStep, VerifyPhoneStep } from './user-profile-phone.steps';

export interface UserProfileAddSmsViewProps {
  onCancel: () => void;
  selectRef?: Ref<HTMLButtonElement>;
  phoneRef?: Ref<HTMLInputElement>;
  step: 'select' | 'phone' | 'verify';
  direction?: FlowDirection;
  phoneNumbers: readonly { id: string; phoneNumber: string }[];
  selectedPhoneId: string;
  onSelectedPhoneIdChange: (id: string) => void;
  onAddPhone: () => void;
  onBack: () => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  isPending?: boolean;
  errorMessage?: string;
  isResending?: boolean;
  resendSeconds?: number;
}

export function UserProfileAddSmsView(props: UserProfileAddSmsViewProps) {
  const m = useMessages('userProfileAddSms');
  const selectRef = useMergeRefs([props.selectRef, useFlowAutoFocus<HTMLButtonElement>()]);
  const phoneRef = useMergeRefs([props.phoneRef, useFlowAutoFocus<HTMLInputElement>()]);
  return (
    <Flow.Root
      value={props.step}
      direction={props.direction}
      state={props}
    >
      {current => {
        const backAction = (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={current.isPending || current.isResending}
            onClick={current.onBack}
          >
            {m.back}
          </Button>
        );
        return (
          <>
            <Flow.Step ids={['select']}>
              <SelectPhoneStep
                {...current}
                inputRef={selectRef}
              />
            </Flow.Step>
            <Flow.Step ids={['phone']}>
              <EnterPhoneStep
                inputRef={phoneRef}
                phoneNumber={current.phoneNumber}
                onPhoneNumberChange={current.onPhoneNumberChange}
                onSubmit={current.onSubmit}
                isPending={current.isPending}
                errorMessage={current.errorMessage}
                secondaryAction={backAction}
              />
            </Flow.Step>
            <Flow.Step ids={['verify']}>
              <VerifyPhoneStep
                phoneNumber={current.phoneNumber}
                code={current.code}
                onCodeChange={current.onCodeChange}
                onSubmit={current.onSubmit}
                onResend={current.onResend}
                isPending={current.isPending}
                errorMessage={current.errorMessage}
                isResending={current.isResending}
                resendSeconds={current.resendSeconds}
                secondaryAction={backAction}
              />
            </Flow.Step>
          </>
        );
      }}
    </Flow.Root>
  );
}

function SelectPhoneStep(props: UserProfileAddSmsViewProps & { inputRef?: Ref<HTMLButtonElement> }) {
  const m = useMessages('userProfileAddSms');
  const formId = useId();
  const inputRef = useMergeRefs([props.inputRef, useFlowAutoFocus<HTMLButtonElement>()]);
  return (
    <>
      <Card.Header>
        <Card.Title>{m.title}</Card.Title>
        <Card.Description>{m.description}</Card.Description>
      </Card.Header>
      <Card.Content
        render={
          <form
            id={formId}
            onSubmit={event => {
              event.preventDefault();
              if (!props.isPending && props.selectedPhoneId) {
                props.onSubmit();
              }
            }}
          />
        }
      >
        <Field.Root
          required
          disabled={props.isPending}
          invalid={Boolean(props.errorMessage)}
        >
          <Field.Label>{m.phoneLabel}</Field.Label>
          <Select.Root
            items={props.phoneNumbers.map(phone => ({
              value: phone.id,
              label: stringToFormattedPhoneString(phone.phoneNumber),
            }))}
            value={props.selectedPhoneId}
            onValueChange={props.onSelectedPhoneIdChange}
          >
            <Select.Trigger
              ref={inputRef}
              placeholder={m.phonePlaceholder}
            />
            <Select.Popup />
          </Select.Root>
          <Field.Message>
            <Field.Error>{props.errorMessage}</Field.Error>
          </Field.Message>
        </Field.Root>
        <Button
          type='button'
          variant='link'
          color='neutral'
          size='sm'
          disabled={props.isPending}
          onClick={props.onAddPhone}
        >
          {m.addPhone}
        </Button>
      </Card.Content>
      <Card.Footer>
        <Button
          type='button'
          variant='outline'
          color='neutral'
          fullWidth
          disabled={props.isPending}
          onClick={props.onCancel}
        >
          {m.cancel}
        </Button>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={props.isPending}
          disabled={!props.selectedPhoneId}
          pendingLabel={m.pending}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
