import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Alert, Col, descriptors, Flow, localizationKeys, Text } from '../customizables';
import { useRouter } from '../router';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Header } from './Header';
import { IdentityPreview } from './IdentityPreview';
import { TimerButton } from './TimerButton';

type VerificationLinkCardProps = {
  safeIdentifier: string | undefined | null;
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  cardNotice?: LocalizationKey;
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
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={props.cardTitle} />
            <VerificationLink
              formSubtitle={props.formSubtitle}
              resendButton={props.resendButton}
              onResendCodeClicked={props.onResendCodeClicked}
            >
              {' '}
              <IdentityPreview
                identifier={props.safeIdentifier}
                avatarUrl={props.profileImageUrl}
                onClick={goBack}
              />
            </VerificationLink>
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {props.cardNotice && (
            <Alert colorScheme='warning'>
              <Text
                colorScheme='warning'
                localizationKey={props.cardNotice}
                variant='caption'
              />
            </Alert>
          )}
          <Card.Action elementId='alternativeMethods'>
            {props.onShowAlternativeMethodsClicked && (
              <Card.ActionLink
                localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}
                onClick={props.onShowAlternativeMethodsClicked}
              />
            )}
          </Card.Action>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

type VerificationLinkProps = {
  formSubtitle?: LocalizationKey;
  resendButton: LocalizationKey;
  onResendCodeClicked: React.MouseEventHandler;
  children?: React.ReactNode;
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
        {!!props.formSubtitle && (
          <Text
            localizationKey={props.formSubtitle}
            elementDescriptor={descriptors.formHeaderSubtitle}
            colorScheme='secondary'
          />
        )}
        {props.children}
      </Col>
      <TimerButton
        localizationKey={props.resendButton}
        elementDescriptor={descriptors.formResendCodeLink}
        onClick={props.onResendCodeClicked}
        startDisabled
        isDisabled={card.isLoading}
        throttleTimeInSec={60}
        sx={theme => ({ marginTop: theme.space.$4, width: '100%' })}
      />
    </Col>
  );
};
