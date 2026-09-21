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

type SignInFactorOneSSOBypassProps = {
  bypassFactor: EmailCodeFactor;
};

/**
 * Enterprise-routed sign-in for a user the instance has allowlisted for a bypass.
 *
 * Replaces the automatic redirect to the identity provider with a screen the user can act on,
 * since the bypass is only reachable from one.
 * @experimental
 */
export const SignInFactorOneSSOBypass = (props: SignInFactorOneSSOBypassProps) => {
  const { bypassFactor } = props;
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
      <Flow.Part part='ssoBypass'>
        <SignInFactorOneCodeForm
          factor={bypassFactor}
          factorAlreadyPrepared={false}
          onFactorPrepare={() => {}}
          cardTitle={localizationKeys('signIn.ssoBypass.code.title')}
          cardSubtitle={localizationKeys('signIn.ssoBypass.code.subtitle')}
          cardNotice={localizationKeys('signIn.ssoBypass.notice')}
          inputLabel={localizationKeys('signIn.emailCode.formTitle')}
          resendButton={localizationKeys('signIn.ssoBypass.code.resendButton')}
          identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
          onShowAlternativeMethodsClicked={() => goToStep('sso')}
        />
      </Flow.Part>
    );
  }

  const bypassAction = (
    <Card.Action elementId='ssoBypass'>
      <Card.ActionLink
        localizationKey={localizationKeys('signIn.ssoBypass.actionLink')}
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
      <Flow.Part part='ssoBypass'>
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signIn.enterpriseConnections.title')}
          subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
          onClick={handleSelectEnterpriseConnection}
          enterpriseConnections={enterpriseConnections}
        >
          {bypassAction}
        </ChooseEnterpriseConnectionCard>
      </Flow.Part>
    );
  }

  return (
    <Flow.Part part='ssoBypass'>
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
            {bypassAction}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
