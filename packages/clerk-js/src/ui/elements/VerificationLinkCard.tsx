import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flow, localizationKeys, Text } from '../customizables';
import { useRouter } from '../router';
import { Card } from '.';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';
import { TimerButton } from './TimerButton';

type VerificationLinkCardProps = {
  safeIdentifier: string | undefined | null;
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  resendButton: LocalizationKey;
  profileImageUrl?: string;
  onResendCodeClicked: React.MouseEventHandler;
  onShowAlternativeMethodsClicked?: React.MouseEventHandler;
};

export const VerificationLinkCard = (props: VerificationLinkCardProps) => {
  const { navigate } = useRouter();
  const card = useCardState();

  const goBack = () => {
    return navigate('../');
  };

  return (
    <Flow.Part part='emailLinkVerify'>
      <Card.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Header.Root>
          <Header.Title localizationKey={props.cardTitle} />
          <Header.Subtitle localizationKey={props.cardSubtitle} />
        </Header.Root>
        <IdentityPreview
          identifier={props.safeIdentifier}
          avatarUrl={props.profileImageUrl}
          onClick={goBack}
        />
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <VerificationLink
            formTitle={props.formTitle}
            formSubtitle={props.formSubtitle}
            resendButton={props.resendButton}
            onResendCodeClicked={props.onResendCodeClicked}
          />
        </Col>
        <Footer.Root>
          <Footer.Action elementId='alternativeMethods'>
            {props.onShowAlternativeMethodsClicked && (
              <Footer.ActionLink
                localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
                onClick={props.onShowAlternativeMethodsClicked}
              />
            )}
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card.Root>
    </Flow.Part>
  );
};

type VerificationLinkProps = {
  formTitle: LocalizationKey;
  formSubtitle: LocalizationKey;
  resendButton: LocalizationKey;
  onResendCodeClicked: React.MouseEventHandler;
};

export const VerificationLink = (props: VerificationLinkProps) => {
  const card = useCardState();
  return (
    <Col
      elementDescriptor={descriptors.form}
      gap={1}
    >
      <Col
        elementDescriptor={descriptors.formHeader}
        gap={1}
      >
        <Text
          localizationKey={props.formTitle}
          elementDescriptor={descriptors.formHeaderTitle}
          variant='subtitle'
        />
        <Text
          localizationKey={props.formSubtitle}
          elementDescriptor={descriptors.formHeaderSubtitle}
          colorScheme='neutral'
        />
      </Col>
      <TimerButton
        localizationKey={props.resendButton}
        elementDescriptor={descriptors.formResendCodeLink}
        onClick={props.onResendCodeClicked}
        startDisabled
        isDisabled={card.isLoading}
        throttleTimeInSec={60}
        sx={theme => ({ marginTop: theme.space.$4 })}
      />
    </Col>
  );
};
