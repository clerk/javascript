import type { EmailCodeFactor } from '@clerk/shared/types';
import React from 'react';

import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignIn, useSignInContext } from '../../contexts';
import { Button, Col, descriptors, Flow, localizationKeys } from '../../customizables';
import { hasMultipleEnterpriseConnections } from './shared';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type Step = 'sso' | 'code';

type SignInFactorOneSSOFallbackProps = {
  fallbackFactor: EmailCodeFactor;
};

/**
 * Enterprise-routed sign-in for a user the instance has allowlisted for a fallback.
 *
 * Replaces the automatic redirect to the identity provider with a screen the user can act on,
 * since the fallback is only reachable from one.
 * @experimental
 */
export const SignInFactorOneSSOFallback = (props: SignInFactorOneSSOFallbackProps) => {
  const { fallbackFactor } = props;
  const card = useCardState();
  const ctx = useSignInContext();
  const signIn = useCoreSignIn();
  const [step, setStep] = React.useState<Step>('sso');
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const goToStep = (next: Step) => {
    card.setError(undefined);
    setStep(next);
  };

  const authenticateWithEnterpriseSSO = async (enterpriseConnectionId?: string) => {
    await signIn.authenticateWithRedirect({
      strategy: 'enterprise_sso',
      redirectUrl: ctx.ssoCallbackUrl,
      redirectUrlComplete: ctx.afterSignInUrl || '/',
      oidcPrompt: ctx.oidcPrompt,
      continueSignIn: true,
      ...(enterpriseConnectionId && { enterpriseConnectionId }),
    });
  };

  const handleSSOError = (err: Error) => handleError(err, [], card.setError);

  const handleContinueWithSSO = () => {
    setIsRedirecting(true);
    authenticateWithEnterpriseSSO().catch(err => {
      setIsRedirecting(false);
      handleSSOError(err);
    });
  };

  // The connection button only resets its own loading state on rejection, so surface the error
  // here and rethrow to keep that reset.
  const handleSelectEnterpriseConnection = (enterpriseConnectionId: string) =>
    authenticateWithEnterpriseSSO(enterpriseConnectionId).catch(err => {
      handleSSOError(err);
      throw err;
    });

  if (step === 'code') {
    return (
      <Flow.Part part='ssoFallback'>
        <SignInFactorOneCodeForm
          factor={fallbackFactor}
          factorAlreadyPrepared={false}
          onFactorPrepare={() => {}}
          cardTitle={localizationKeys('signIn.ssoFallback.code.title')}
          cardSubtitle={localizationKeys('signIn.ssoFallback.code.subtitle')}
          cardNotice={localizationKeys('signIn.ssoFallback.notice')}
          inputLabel={localizationKeys('signIn.emailCode.formTitle')}
          resendButton={localizationKeys('signIn.ssoFallback.code.resendButton')}
          identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
          onShowAlternativeMethodsClicked={() => goToStep('sso')}
        />
      </Flow.Part>
    );
  }

  const fallbackAction = (
    <Card.Action elementId='ssoFallback'>
      <Card.ActionLink
        localizationKey={localizationKeys('signIn.ssoFallback.actionLink')}
        onClick={() => goToStep('code')}
      />
    </Card.Action>
  );

  if (hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    const enterpriseConnections = signIn.supportedFirstFactors.map(factor => ({
      id: factor.enterpriseConnectionId,
      name: factor.enterpriseConnectionName,
    }));

    return (
      <Flow.Part part='ssoFallback'>
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signIn.enterpriseConnections.title')}
          subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
          onClick={handleSelectEnterpriseConnection}
          enterpriseConnections={enterpriseConnections}
        >
          {fallbackAction}
        </ChooseEnterpriseConnectionCard>
      </Flow.Part>
    );
  }

  return (
    <Flow.Part part='ssoFallback'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.start.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.start.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Button
              elementDescriptor={descriptors.formButtonPrimary}
              block
              hasArrow
              isLoading={isRedirecting}
              localizationKey={localizationKeys('signIn.enterpriseSSO.formButtonPrimary')}
              onClick={handleContinueWithSSO}
            />
            {fallbackAction}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
