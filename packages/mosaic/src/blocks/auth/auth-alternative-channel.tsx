import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';

import { Button, SubmitButton } from '../../components/button';
import { Card } from '../../components/card';
import { Field } from '../../components/field';
import type { UseFormResult } from '../../components/form';
import { PhoneInput } from '../../components/phone-input';
import { fill } from '../../localization';
import { useFlowAutoFocus } from '../../primitives/flow/flow-step-context';
import { Form } from '../../primitives/form';
import { styles } from './auth.styles';
import type { AuthProvider } from './auth.types';
import { AuthCaptcha } from './auth-captcha';

export interface AuthAlternativeChannelMessages {
  title: string;
  description: string;
  fieldLabel: string;
  phonePlaceholder: string;
  selectedCountry: string;
  chooseCountry: string;
  searchCountries: string;
  countrySearchPlaceholder: string;
  noCountries: string;
  secondaryActionLabel: string;
  primaryActionLabel: string;
  pendingLabel: string;
}

interface AuthAlternativeChannelProps<TValues extends { phoneNumber: string }> {
  messages: AuthAlternativeChannelMessages;
  channel: AuthProvider;
  applicationName: string;
  logo?: { src: string; alt: string };
  form: UseFormResult<TValues>;
  globalErrorMessage?: string;
  isPending: boolean;
  isDisabled: boolean;
  onSubmit: (event: { preventDefault: () => void }) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  children?: ReactNode;
}

export function AuthAlternativeChannel<TValues extends { phoneNumber: string }>({
  messages,
  channel,
  applicationName,
  logo,
  form,
  globalErrorMessage,
  isPending,
  isDisabled,
  onSubmit,
  onCancel,
  focusRef,
  children,
}: AuthAlternativeChannelProps<TValues>) {
  const { ref: phoneFieldRef, ...phone } = form.registerValue('phoneNumber');
  const phoneRef = useMergeRefs<HTMLElement>([phoneFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const { feedback } = form.fields.phoneNumber;
  const provider = channel.name;

  return (
    <>
      <Card.Header>
        {logo ? (
          <Card.Media>
            <img
              src={logo.src}
              alt={logo.alt}
              {...stylex.props(styles.logo)}
            />
          </Card.Media>
        ) : null}
        <Card.Title>{fill(messages.title, { applicationName, provider })}</Card.Title>
        <Card.Description>{fill(messages.description, { provider })}</Card.Description>
      </Card.Header>
      <Card.Banner
        role='alert'
        color='negative'
      >
        {globalErrorMessage}
      </Card.Banner>
      <Card.Content>
        <Form
          id={form.id}
          onSubmit={onSubmit}
        >
          <div {...stylex.props(styles.fieldStack)}>
            <Field.Root
              required
              invalid={feedback?.type === 'error'}
              disabled={isDisabled}
              focusableWhenDisabled
            >
              <Field.Label>{fill(messages.fieldLabel, { provider })}</Field.Label>
              <PhoneInput
                ref={phoneRef}
                autoComplete='tel'
                placeholder={messages.phonePlaceholder}
                countryTriggerLabel={messages.selectedCountry}
                countryPopupLabel={messages.chooseCountry}
                countrySearchLabel={messages.searchCountries}
                countrySearchPlaceholder={messages.countrySearchPlaceholder}
                noResultsMessage={messages.noCountries}
                {...phone}
              />
              <Field.Feedback feedback={feedback} />
            </Field.Root>
            {children}
          </div>
        </Form>
        <AuthCaptcha />
      </Card.Content>
      <Card.Footer>
        {onCancel ? (
          <Button
            type='button'
            variant='outline'
            color='neutral'
            fullWidth
            disabled={isDisabled}
            onClick={onCancel}
          >
            {messages.secondaryActionLabel}
          </Button>
        ) : null}
        <SubmitButton
          form={form.id}
          fullWidth
          disabled={!form.canSubmit}
          focusableWhenDisabled
          isPending={isPending}
          pendingLabel={messages.pendingLabel}
        >
          {messages.primaryActionLabel}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
