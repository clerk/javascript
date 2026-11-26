import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { FormEvent, ReactNode, Ref } from 'react';
import { useId, useRef } from 'react';

import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import { Otp } from '../../components/otp';
import { Spinner } from '../../components/spinner';
import { Text } from '../../components/text';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import { Form } from '../../primitives/form';
import { CODE_LENGTH } from '../../utils/verification';
import { Prompt } from '../prompt';
import { styles } from './verification.styles';
import type { VerificationLayout } from './verification-actions';
import { useVerificationLayout, VerificationActions } from './verification-actions';
import type { VerificationLink } from './verification-links';
import { VerificationLinks } from './verification-links';

export interface VerificationCodeMessages {
  title: string;
  description: ReactNode;
  fieldLabel: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

export interface VerificationCodeResend {
  text: string;
  label: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

interface VerificationCodeProps {
  messages: VerificationCodeMessages;
  value: string;
  length?: number;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending?: boolean;
  resend?: VerificationCodeResend;
  identity?: ReactNode;
  /** A second way out on a full-page card, such as using a different email, shown beside the secondary action. */
  prompt?: ReactNode;
  notice?: string;
  /** Other ways to verify, shown under the field on a stacked card in place of the secondary action. */
  alternatives?: ReactNode;
  onValueChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  /** `stacked` is for a full-page card: the code submits itself once complete, and the other ways out sit as links under the field. Defaults to `stacked` on a card whose `actions` stack, otherwise `inline`. */
  layout?: VerificationLayout;
}

export function VerificationCode({
  messages,
  value,
  length = CODE_LENGTH,
  errorMessage,
  globalErrorMessage,
  isPending = false,
  resend,
  identity,
  prompt,
  notice,
  alternatives,
  onValueChange,
  onComplete,
  onSubmit,
  onCancel,
  focusRef,
  layout: layoutProp,
}: VerificationCodeProps) {
  const layout = useVerificationLayout(layoutProp);
  const formId = useId();
  const otpRef = useRef<HTMLElement>(null);
  const onResend = () => {
    resend?.onClick();
    otpRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPending) {
      onSubmit();
    }
  };

  const links: VerificationLink[] = onCancel
    ? [{ label: messages.secondaryActionLabel, onClick: onCancel, variant: 'outline' as const }]
    : [];

  const actions = (
    <VerificationActions
      layout={layout}
      primary={
        <SubmitButton
          form={formId}
          fullWidth={layout === 'stacked' || undefined}
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      }
      secondaryLabel={messages.secondaryActionLabel}
      onSecondary={onCancel}
      disabled={isPending}
    />
  );

  return (
    <>
      <Card.Header>
        <Card.Title>{messages.title}</Card.Title>
        <Card.Description>{messages.description}</Card.Description>
        {identity}
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        {notice ? (
          <Banner.Root color='warning'>
            <Banner.Label>{notice}</Banner.Label>
          </Banner.Root>
        ) : null}
        <div {...stylex.props(layout === 'stacked' && styles.fieldGroup)}>
          <Form
            id={formId}
            onSubmit={handleSubmit}
          >
            <Field.Root
              required
              invalid={Boolean(errorMessage)}
              disabled={isPending}
              focusableWhenDisabled
              xstyle={layout === 'stacked' ? styles.stackedField : undefined}
            >
              <Field.Label visuallyHidden>{messages.fieldLabel}</Field.Label>
              <Otp
                ref={useMergeRefs<HTMLElement>([focusRef, useFlowAutoFocus<HTMLInputElement>(), otpRef])}
                name='code'
                length={length}
                value={value}
                onValueChange={onValueChange}
                onComplete={code => {
                  if (!isPending) {
                    onComplete?.(code);
                  }
                }}
              />
              <Field.Message>
                <Field.Error xstyle={layout === 'stacked' ? styles.errorEnter : undefined}>{errorMessage}</Field.Error>
              </Field.Message>
              {resend && layout === 'inline' ? (
                <Field.Description>
                  {resend.text}{' '}
                  <Button
                    type='button'
                    size='sm'
                    color='neutral'
                    variant='link'
                    disabled={resend.disabled || isPending}
                    onClick={onResend}
                  >
                    {resend.label}
                  </Button>
                </Field.Description>
              ) : null}
            </Field.Root>
          </Form>
          {layout === 'stacked' ? (
            <ResendRow
              resend={resend}
              onResend={onResend}
              isPending={isPending}
              pendingLabel={messages.pendingLabel}
            />
          ) : null}
        </div>
        {layout === 'stacked' && (alternatives || resend || !isPending) ? (
          <div {...stylex.props(styles.actions)}>
            {alternatives}
            {resend || !isPending ? (
              <VerificationLinks
                links={links}
                prompt={prompt}
                disabled={isPending}
              />
            ) : null}
          </div>
        ) : null}
      </Card.Content>
      {layout === 'inline' ? actions : null}
    </>
  );
}

function ResendRow({
  resend,
  onResend,
  isPending,
  pendingLabel,
}: {
  resend?: VerificationCodeResend;
  onResend: () => void;
  isPending: boolean;
  pendingLabel: string;
}) {
  if (isPending) {
    return (
      <Text
        role='status'
        size='sm'
        color='foreground-secondary'
        xstyle={styles.status}
      >
        <Spinner size='sm' />
        {pendingLabel}
      </Text>
    );
  }
  return resend ? (
    <Prompt
      text={resend.text}
      action={resend.label}
      disabled={resend.disabled}
      onAction={onResend}
    />
  ) : null;
}
