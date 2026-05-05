import { useReverification, useUser } from '@clerk/shared/react';
import React from 'react';

import { Col, Flow, Form, Heading, Icon, Input, Text } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { useRegisterContinueAction, useWizard } from '@/elements/Wizard';
import { DuotoneAtSymbol } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { StepLayout } from './StepLayout';

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const AddEmailAddressStep = (): JSX.Element => {
  const { goNext } = useWizard();
  const { user } = useUser();
  const card = useCardState();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createEmailAddress = useReverification((value: string) => user?.createEmailAddress({ email: value }));

  const canSubmit = isValidEmail(email) && !isSubmitting;

  const submit = React.useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    card.setError(undefined);

    try {
      await createEmailAddress(email);
      await goNext();
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, email, createEmailAddress, card, goNext]);

  useRegisterContinueAction({
    handler: submit,
    isDisabled: !canSubmit,
    isLoading: isSubmitting,
  });

  // Clear any stale card error when this step mounts so it doesn't leak in
  // from a previous flow / step
  React.useEffect(() => {
    card.setError(undefined);
    return () => card.setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flow.Part part='addEmailAddress'>
      <StepLayout
        title='Verify email address'
        subtitle='Verify the domain you want to enable the enterprise connection on.'
      >
        <Form
          onSubmit={e => {
            e.preventDefault();
            void submit();
          }}
          sx={{ flex: 1, display: 'flex' }}
        >
          <Col
            align='center'
            sx={t => ({
              flex: 1,
              justifyContent: 'center',
              gap: t.space.$5,
              maxWidth: t.sizes.$66,
              marginInline: 'auto',
              textAlign: 'center',
              width: '100%',
              paddingBlock: t.space.$8,
            })}
          >
            <Icon
              icon={DuotoneAtSymbol}
              sx={t => ({
                width: t.sizes.$8,
                height: t.sizes.$8,
                color: t.colors.$neutralAlpha600,
              })}
            />

            <Col sx={t => ({ gap: t.space.$1 })}>
              <Heading
                textVariant='h2'
                sx={t => ({ color: t.colors.$colorForeground })}
              >
                We need your email
              </Heading>
              <Text
                as='p'
                variant='body'
                sx={t => ({ color: t.colors.$colorMutedForeground })}
              >
                In order to start we will need your email address
              </Text>
            </Col>

            <Col sx={t => ({ gap: t.space.$1x5, width: '100%' })}>
              <Input
                type='email'
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder='name@company.com'
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
                hasError={Boolean(card.error)}
                isDisabled={isSubmitting}
                aria-label='Email address'
              />
              {card.error ? (
                <Text
                  as='p'
                  variant='body'
                  sx={t => ({ color: t.colors.$danger500, fontSize: t.fontSizes.$sm, textAlign: 'start' })}
                >
                  {card.error}
                </Text>
              ) : null}
            </Col>
          </Col>
        </Form>
      </StepLayout>
    </Flow.Part>
  );
};
