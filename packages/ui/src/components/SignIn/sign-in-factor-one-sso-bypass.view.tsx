import type { EmailCodeFactor } from '@clerk/shared/types';

import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { Button, Col, descriptors, Flow, localizationKeys } from '../../customizables';
import type { useSignInFactorOneSSOBypassController } from './sign-in-factor-one-sso-bypass.controller';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOneSSOBypassViewProps = ReturnType<typeof useSignInFactorOneSSOBypassController> & {
  bypassFactor: EmailCodeFactor;
};

export function SignInFactorOneSSOBypassView(props: SignInFactorOneSSOBypassViewProps) {
  if (props.step === 'code') {
    return (
      <Flow.Part part='ssoBypass'>
        <SignInFactorOneCodeForm
          factor={props.bypassFactor}
          factorAlreadyPrepared={false}
          onFactorPrepare={() => {}}
          cardTitle={localizationKeys('signIn.ssoBypass.code.title')}
          cardSubtitle={localizationKeys('signIn.ssoBypass.code.subtitle')}
          cardNotice={localizationKeys('signIn.ssoBypass.notice')}
          inputLabel={localizationKeys('signIn.emailCode.formTitle')}
          resendButton={localizationKeys('signIn.ssoBypass.code.resendButton')}
          identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
          onShowAlternativeMethodsClicked={() => props.goToStep('sso')}
        />
      </Flow.Part>
    );
  }

  const bypassAction = (
    <Card.Action elementId='ssoBypass'>
      <Card.ActionLink
        localizationKey={localizationKeys('signIn.ssoBypass.actionLink')}
        onClick={() => props.goToStep('code')}
      />
    </Card.Action>
  );

  if (props.hasMultipleConnections) {
    return (
      <Flow.Part part='ssoBypass'>
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signIn.enterpriseConnections.title')}
          subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
          onClick={props.handleSelectEnterpriseConnection}
          enterpriseConnections={props.enterpriseConnections}
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
          <Card.Alert>{props.error}</Card.Alert>
          <Col
            elementDescriptor={descriptors.main}
            gap={4}
          >
            <Button
              elementDescriptor={descriptors.formButtonPrimary}
              block
              hasArrow
              isLoading={props.isRedirecting}
              localizationKey={localizationKeys('signIn.enterpriseSSO.formButtonPrimary')}
              onClick={props.handleContinueWithSSO}
            />
            {bypassAction}
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
}
