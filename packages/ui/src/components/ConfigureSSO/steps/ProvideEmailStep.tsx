import { useReverification, useUser } from '@clerk/shared/react/index';
import React from 'react';

import { Col, Flow, Form, Heading, Icon, Input, localizationKeys, Text, useLocalizations } from '@/customizables';
import { useCardState } from '@/elements/contexts';
import { DuotoneAtSymbol } from '@/icons';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSOWizard, useRegisterContinueAction } from '../wizard';
import { StepLayout } from './StepLayout';

const isEmail = (str: string) => /^\S+@\S+\.\S+$/.test(str);

export const ProvideEmail = (): JSX.Element => {
  const { goNext } = useConfigureSSOWizard();
  const { user } = useUser();
  const card = useCardState();
  const { t } = useLocalizations();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createEmailAddress = useReverification((value: string) => user?.createEmailAddress({ email: value }));

  const canSubmit = isEmail(email) && !isSubmitting;

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
    <Flow.Part part='provideEmail'>
      <StepLayout
        title={localizationKeys('configureSSO.verifyEmailDomainStep.title')}
        subtitle={localizationKeys('configureSSO.verifyEmailDomainStep.subtitle')}
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
                localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.formTitle')}
              />
              <Text
                as='p'
                variant='body'
                sx={t => ({ color: t.colors.$colorMutedForeground })}
                localizationKey={localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.formSubtitle')}
              />
            </Col>

            <Col sx={t => ({ gap: t.space.$1x5, width: '100%' })}>
              <Input
                type='email'
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder={t(localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.inputPlaceholder'))}
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
                hasError={Boolean(card.error)}
                isDisabled={isSubmitting}
                aria-label={t(localizationKeys('configureSSO.verifyEmailDomainStep.addEmailAddress.inputLabel'))}
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
