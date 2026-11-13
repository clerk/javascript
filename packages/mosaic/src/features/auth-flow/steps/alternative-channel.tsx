import { useMergeRefs } from '@floating-ui/react';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode, Ref } from 'react';

import { Button, SubmitButton } from '../../../components/button';
import { Card } from '../../../components/card';
import { Field } from '../../../components/field';
import { useFlowAutoFocus } from '../../../components/flow';
import type { FieldFeedback, UseFormResult } from '../../../components/form';
import { PhoneInput } from '../../../components/phone-input';
import { fill, useMessages } from '../../../localization';
import { Form } from '../../../primitives/form';
import { styles } from '../auth-flow.styles';
import type { AuthFlowProvider, AuthFlowSubmitEvent, AuthFlowValues } from '../auth-flow.types';
import { FlowCaptcha } from './captcha';

interface AlternativeChannelStepProps {
  channel: AuthFlowProvider;
  applicationName: string;
  logo?: { src: string; alt: string };
  form: UseFormResult<AuthFlowValues>;
  errorMessage?: string;
  globalErrorMessage?: string;
  isPending: boolean;
  isDisabled: boolean;
  onSubmit: (event: AuthFlowSubmitEvent) => void;
  onCancel?: () => void;
  focusRef?: Ref<HTMLElement>;
  copy?: { title: string; description: string; label: string };
  children?: ReactNode;
}

export function AlternativeChannelStep({
  channel,
  applicationName,
  logo,
  form,
  errorMessage,
  globalErrorMessage,
  isPending,
  isDisabled,
  onSubmit,
  onCancel,
  focusRef,
  copy: copyProp,
  children,
}: AlternativeChannelStepProps) {
  const m = useMessages('signIn');
  const { ref: phoneFieldRef, ...phone } = form.registerValue('phoneNumber');
  const phoneRef = useMergeRefs<HTMLElement>([phoneFieldRef, focusRef, useFlowAutoFocus<HTMLInputElement>()]);
  const feedback: FieldFeedback | undefined = errorMessage ? { type: 'error', message: errorMessage } : undefined;
  const provider = channel.name;
  const copy = copyProp ?? m.alternativeChannel;

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
        <Card.Title>{fill(copy.title, { applicationName, provider })}</Card.Title>
        <Card.Description>{fill(copy.description, { provider })}</Card.Description>
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
              <Field.Label>{fill(copy.label, { provider })}</Field.Label>
              <PhoneInput
                ref={phoneRef}
                autoComplete='tel'
                placeholder={m.start.phonePlaceholder}
                countryTriggerLabel={m.start.selectedCountry}
                countryPopupLabel={m.start.chooseCountry}
                countrySearchLabel={m.start.searchCountries}
                countrySearchPlaceholder={m.start.countrySearchPlaceholder}
                noResultsMessage={m.start.noCountries}
                {...phone}
              />
              <Field.Feedback feedback={feedback} />
            </Field.Root>
            {children}
          </div>
        </Form>
        <FlowCaptcha />
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
            {m.useAnotherMethod}
          </Button>
        ) : null}
        <SubmitButton
          form={form.id}
          fullWidth
          isPending={isPending}
          pendingLabel={m.verifying}
        >
          {m.continue}
        </SubmitButton>
      </Card.Footer>
    </>
  );
}
