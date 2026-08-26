import { Otp } from '@clerk/headless/otp';
import type { FormEvent } from 'react';
import { useId } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { Field } from '../../components/field';
import { Heading } from '../../components/heading';
import { Input } from '../../components/input';
import { Text } from '../../components/text';

/** One selectable verification method. `id` is opaque to the block and handed straight back. */
export interface ReverificationDialogMethod {
  id: string;
  label: string;
}

/** A labelled callback the caller decides to offer — rendered only when supplied. */
export interface ReverificationDialogAction {
  label: string;
  onClick: () => void;
}

export interface ReverificationDialogField {
  label: string;
  /** `code` renders per-character slots; `password` masks the value; `text` is a plain field. */
  kind: 'code' | 'password' | 'text';
  value: string;
  disabled: boolean;
  /** Why this field's value was rejected. Renders under the field and marks it invalid. */
  error?: string;
  onChange: (value: string) => void;
}

export interface ReverificationDialogResend {
  label: string;
  disabled: boolean;
  onResend: () => void;
}

interface ReverificationDialogBaseProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Whether close requests and explicit close controls may dismiss the dialog. */
  dismissible: boolean;
  /** Dialog heading */
  title: string;
  /** What is being asked of the user */
  description: string;
  /** Accessible name for the corner close button */
  closeLabel: string;
  /** A failure that belongs to the step rather than to a field. Announced as an alert. */
  error?: string;
}

/** Pick a verification method from a list. */
export interface ReverificationDialogChooseProps extends ReverificationDialogBaseProps {
  step: 'choose';
  methods: ReverificationDialogMethod[];
  onSelectMethod: (id: string) => void;
  /** Returns to the method the user came from. Absent when there is nothing to go back to. */
  back?: ReverificationDialogAction;
  cancelLabel: string;
  help: ReverificationDialogAction;
}

/** Satisfy one method: type a code or password, or present a passkey. */
export interface ReverificationDialogVerifyProps extends ReverificationDialogBaseProps {
  step: 'verify';
  /** The identity the code went to, e.g. a redacted phone number. */
  identifier?: string;
  /** Absent for a method with nothing to type, such as a passkey. */
  field?: ReverificationDialogField;
  resend?: ReverificationDialogResend;
  submitLabel: string;
  /** Accessible name for the pending indicator on the submit button */
  pendingLabel: string;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: () => void;
  cancelLabel: string;
  /** The one escape this step offers — another method, or help. */
  secondary?: ReverificationDialogAction;
}

/** A dead end: help, or no methods to offer. */
export interface ReverificationDialogMessageProps extends ReverificationDialogBaseProps {
  step: 'message';
  /** The way forward from a dead end — reaching a human. */
  action: ReverificationDialogAction;
  /** An optional secondary action, such as returning or cancelling. */
  secondary?: ReverificationDialogAction;
}

export type ReverificationDialogProps =
  | ReverificationDialogChooseProps
  | ReverificationDialogVerifyProps
  | ReverificationDialogMessageProps;

/** Every code this dialog asks for is six characters, the length the flow's controller normalizes to. */
const CODE_LENGTH = 6;

/**
 * The code slots, straight off the headless primitive and unstyled for now — Mosaic has no
 * styled OTP component yet. Typing advances, `Backspace` walks back, and a pasted code spreads
 * across the slots.
 */
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

/**
 * The dialog that asks a user to prove who they are before a sensitive action. Renders one of
 * three steps — pick a method, satisfy it, or a dead end — and owns none of the flow between
 * them.
 *
 * Controlled and stateless: every label, every enabled/disabled decision, and `open` itself
 * belong to the caller. The block holds nothing, so a step renders identically whether it was
 * reached from a controller or from a story.
 *
 * @example
 * <ReverificationDialog
 *   step='verify'
 *   open={snapshot.value !== 'cancelled'}
 *   onOpenChange={open => !open && send({ type: 'CANCEL' })}
 *   dismissible={snapshot.can({ type: 'CANCEL' })}
 *   title='Verification required'
 *   description='Enter the code sent to your email to continue'
 *   closeLabel='Close'
 *   field={{ label: 'Verification code', kind: 'code', value, disabled: false, onChange }}
 *   submitLabel='Continue'
 *   pendingLabel='Verifying'
 *   canSubmit={canSubmit}
 *   isPending={snapshot.value === 'submitting'}
 *   onSubmit={() => send({ type: 'SUBMIT' })}
 *   cancelLabel='Cancel'
 * />
 */
export function ReverificationDialog(props: ReverificationDialogProps) {
  const { open, onOpenChange, dismissible, title, description, closeLabel, error } = props;

  return (
    <Dialog.Root
      size='card'
      closedBy={dismissible ? 'closerequest' : 'none'}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            {dismissible ? <Dialog.CloseButton aria-label={closeLabel} /> : null}
            <Card.Header>
              <Dialog.Title render={<Heading size='sm' />}>{title}</Dialog.Title>
              <Dialog.Description render={<Text />}>{description}</Dialog.Description>
            </Card.Header>
            {error ? (
              <Card.Content>
                <Text
                  role='alert'
                  color='negative'
                >
                  {error}
                </Text>
              </Card.Content>
            ) : null}
            <StepContent {...props} />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StepContent(props: ReverificationDialogProps) {
  switch (props.step) {
    case 'choose':
      return <ChooseStep {...props} />;
    case 'verify':
      return <VerifyStep {...props} />;
    case 'message':
      return <MessageStep {...props} />;
  }
}

function ChooseStep({
  methods,
  onSelectMethod,
  back,
  cancelLabel,
  help,
  dismissible,
}: ReverificationDialogChooseProps) {
  return (
    <>
      <Card.Content>
        {methods.map(method => (
          <Button
            key={method.id}
            fullWidth
            variant='outline'
            onClick={() => onSelectMethod(method.id)}
          >
            {method.label}
          </Button>
        ))}
      </Card.Content>
      <Card.Footer>
        {back ? (
          <Button
            color='neutral'
            fullWidth
            variant='outline'
            onClick={back.onClick}
          >
            {back.label}
          </Button>
        ) : (
          <Dialog.Close
            render={
              <Button
                color='neutral'
                disabled={!dismissible}
                fullWidth
                variant='outline'
              />
            }
          >
            {cancelLabel}
          </Dialog.Close>
        )}
        <Button
          color='neutral'
          variant='link'
          onClick={help.onClick}
        >
          {help.label}
        </Button>
      </Card.Footer>
    </>
  );
}

function VerifyStep({
  identifier,
  field,
  resend,
  submitLabel,
  pendingLabel,
  canSubmit,
  isPending,
  onSubmit,
  cancelLabel,
  secondary,
  dismissible,
}: ReverificationDialogVerifyProps) {
  const formId = useId();
  const fieldId = useId();

  // The action sits in the footer, outside the form, so `form={formId}` associates the two.
  // That is what makes Enter in the field submit. Both guards are re-checked here because
  // neither spelling stops a native submit: `focusableWhenDisabled` only marks the button
  // `aria-disabled`, and `isPending` only cancels the press.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isPending) {
      onSubmit();
    }
  };

  return (
    <>
      <Card.Content>
        {identifier ? <Text size='sm'>{identifier}</Text> : null}
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit}
        >
          {field ? (
            <Field.Root invalid={Boolean(field.error)}>
              {/* A `<label for>` only binds to a labelable element, and the code's group is a
                  `div`, so the label points at the first slot instead. */}
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
      </Card.Content>
      <Card.Footer>
        {secondary ? (
          <Button
            color='neutral'
            disabled={isPending}
            variant='ghost'
            onClick={secondary.onClick}
          >
            {secondary.label}
          </Button>
        ) : null}
        <Dialog.Close
          render={
            <Button
              color='neutral'
              disabled={!dismissible}
              fullWidth
              variant='outline'
            />
          }
        >
          {cancelLabel}
        </Dialog.Close>
        <SubmitButton
          form={formId}
          fullWidth
          isPending={isPending}
          pendingLabel={pendingLabel}
          disabled={!canSubmit}
          focusableWhenDisabled
        >
          {submitLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}

function MessageStep({ action, secondary }: ReverificationDialogMessageProps) {
  return (
    <Card.Footer>
      <Button
        fullWidth
        onClick={action.onClick}
      >
        {action.label}
      </Button>
      {secondary ? (
        <Button
          color='neutral'
          fullWidth
          variant='outline'
          onClick={secondary.onClick}
        >
          {secondary.label}
        </Button>
      ) : null}
    </Card.Footer>
  );
}
