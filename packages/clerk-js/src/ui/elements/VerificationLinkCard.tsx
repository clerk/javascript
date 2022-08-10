import React from 'react';

import { useRouter } from '../router';
import { Col, descriptors, Flow, Text } from '../customizables';
import { CardAlert } from './Alert';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';
import { TimerButton } from './TimerButton';

type VerificationLinkCardProps = {
  safeIdentifier: string;
  cardTitle: string;
  cardSubtitle: string;
  formTitle: string;
  formSubtitle: string;
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
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title>{props.cardTitle}</Header.Title>
          <Header.Subtitle>{props.cardSubtitle}</Header.Subtitle>
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
            onResendCodeClicked={props.onResendCodeClicked}
          />
        </Col>
        <Footer.Root>
          <Footer.Action>
            {props.onShowAlternativeMethodsClicked && (
              <Footer.ActionLink onClick={props.onShowAlternativeMethodsClicked}>Use another method</Footer.ActionLink>
            )}
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};

type VerificationLinkProps = {
  formTitle: string;
  formSubtitle: string;
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
          elementDescriptor={descriptors.formHeaderTitle}
          variant='smallMedium'
        >
          {props.formTitle}
        </Text>
        <Text
          elementDescriptor={descriptors.formHeaderSubtitle}
          variant='smallRegular'
          colorScheme='neutral'
        >
          {props.formSubtitle}
        </Text>
      </Col>
      <TimerButton
        elementDescriptor={descriptors.formResendCodeLink}
        onClick={props.onResendCodeClicked}
        startDisabled
        isDisabled={card.isLoading}
        throttleTimeInSec={60}
        sx={theme => ({ marginTop: theme.space.$4 })}
      >
        Resend link
      </TimerButton>
    </Col>
  );
};
