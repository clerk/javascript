import { Otp } from '@clerk/headless/otp';
import type { FormEvent } from 'react';
import { useId } from 'react';

import { Button } from '../../components/button';
import { Field } from '../../components/field';
import { Input } from '../../components/input';
import { Text } from '../../components/text';

export interface ReverificationMethod {
  id: string;
  label: string;
}

export interface ReverificationField {
  label: string;
  kind: 'code' | 'password' | 'text';
  value: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
}

export interface ReverificationResend {
  label: string;
  disabled: boolean;
  onResend: () => void;
}

interface ReverificationBaseProps {
  error?: string;
}

export interface ReverificationChooseProps extends ReverificationBaseProps {
  step: 'choose';
  methods: ReverificationMethod[];
  onSelectMethod: (id: string) => void;
}

export interface ReverificationVerifyProps extends ReverificationBaseProps {
  step: 'verify';
  identifier?: string;
  field?: ReverificationField;
  resend?: ReverificationResend;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: () => void;
}

export interface ReverificationMessageProps extends ReverificationBaseProps {
  step: 'message';
}

export type ReverificationProps = ReverificationChooseProps | ReverificationVerifyProps | ReverificationMessageProps;

const CODE_LENGTH = 6;

function CodeSlots({ baseId, invalid }: { baseId: string; invalid: boolean }) {
  const { slots } = Otp.useOtp();

  return slots.map(slot => (
    <Otp.Input
      key={slot.index}
      index={slot.index}
      id={`${baseId}-${slot.index}`}
      aria-invalid={invalid || undefined}
    />
  ));
}

export interface ReverificationInternalProps {
  formId?: string;
}

export function Reverification(props: ReverificationProps & ReverificationInternalProps) {
  const generatedFormId = useId();
  const formId = props.formId ?? generatedFormId;

  return (
    <>
      {props.error ? (
        <Text
          role='alert'
          color='negative'
        >
          {props.error}
        </Text>
      ) : null}
      <ReverificationStep
        {...props}
        formId={formId}
      />
    </>
  );
}

function ReverificationStep(props: ReverificationProps & { formId: string }) {
  switch (props.step) {
    case 'choose':
      return (
        <>
          {props.methods.map(method => (
            <Button
              key={method.id}
              color='neutral'
              fullWidth
              variant='outline'
              onClick={() => props.onSelectMethod(method.id)}
            >
              {method.label}
            </Button>
          ))}
        </>
      );
    case 'verify':
      return <Verify {...props} />;
    case 'message':
      return null;
  }
}

function Verify({
  identifier,
  field,
  resend,
  canSubmit,
  isPending,
  onSubmit,
  formId,
}: ReverificationVerifyProps & {
  formId: string;
}) {
  const fieldId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isPending) {
      onSubmit();
    }
  };

  return (
    <>
      {identifier ? <Text size='sm'>{identifier}</Text> : null}
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
      >
        {field ? (
          <Field.Root invalid={Boolean(field.error)}>
            <Field.Label htmlFor={field.kind === 'code' ? `${fieldId}-0` : fieldId}>{field.label}</Field.Label>
            {field.kind === 'code' ? (
              <Otp.Root
                length={CODE_LENGTH}
                aria-label={field.label}
                disabled={field.disabled}
                value={field.value}
                onValueChange={field.onChange}
              >
                <CodeSlots
                  baseId={fieldId}
                  invalid={Boolean(field.error)}
                />
              </Otp.Root>
            ) : (
              <Input
                autoComplete={field.kind === 'password' ? 'current-password' : 'one-time-code'}
                disabled={field.disabled}
                id={fieldId}
                spellCheck={false}
                type={field.kind === 'password' ? 'password' : 'text'}
                value={field.value}
                onChange={event => field.onChange(event.target.value)}
              />
            )}
            {field.error ? <Field.Error>{field.error}</Field.Error> : null}
          </Field.Root>
        ) : null}
      </form>
      {resend ? (
        <Button
          color='neutral'
          disabled={resend.disabled}
          focusableWhenDisabled
          size='sm'
          type='button'
          variant='link'
          onClick={resend.onResend}
        >
          {resend.label}
        </Button>
      ) : null}
    </>
  );
}
