import React from 'react';

import { useRouter } from '../../ui/router';
import { descriptors, Flex, Flow, Text } from '../customizables';
import { useLoadingStatus } from '../hooks';
import { CardAlert } from './Alert';
import { BackLink } from './BackLink';
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
  const status = useLoadingStatus();
  const { navigate } = useRouter();
  const card = useCardState();

  const goBack = () => {
    return navigate('../');
  };

  return (
    <Flow.Part part='emailLinkVerify'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <BackLink onClick={goBack} />
        <Header.Root>
          <Header.Title>{props.cardTitle}</Header.Title>
          <Header.Subtitle>{props.cardSubtitle}</Header.Subtitle>
        </Header.Root>
        <IdentityPreview
          identifier={props.safeIdentifier}
          avatarUrl={props.profileImageUrl}
          onClick={goBack}
        />
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Flex
            direction='col'
            gap={1}
          >
            <Flex direction='col'>
              <Text variant='textSmallMedium'>{props.formTitle}</Text>
              <Text
                variant='textSmallRegular'
                colorScheme='neutral'
              >
                {props.formSubtitle}
              </Text>
            </Flex>
            <TimerButton
              onClick={props.onResendCodeClicked}
              startDisabled
              isDisabled={status.isLoading || card.isLoading}
              throttleTimeInSec={60}
              sx={theme => ({ marginTop: theme.space.$4 })}
            >
              Resend link
            </TimerButton>
          </Flex>
        </Flex>
        <Footer.Root>
          <Footer.Action>
            {props.onShowAlternativeMethodsClicked && (
              <Footer.ActionLink onClick={props.onShowAlternativeMethodsClicked}>Try another method</Footer.ActionLink>
            )}
          </Footer.Action>
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};
