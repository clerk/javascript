import type { EmailLinkVerificationStatus } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Spinner, Text } from '../customizables';
import { Card, Header } from '../elements';
import { useCardState } from '../elements/contexts';
import { ExclamationTriangle, SwitchArrows, TickShield } from '../icons';
import type { InternalTheme } from '../styledSystem';
import { animations } from '../styledSystem';

type EmailLinkStatusCardProps = React.PropsWithChildren<{
  title: LocalizationKey;
  subtitle: LocalizationKey;
  status: EmailLinkVerificationStatus;
}>;

const StatusToIcon: Record<Exclude<EmailLinkVerificationStatus, 'loading'>, React.ComponentType> = {
  verified: TickShield,
  verified_switch_tab: SwitchArrows,
  expired: ExclamationTriangle,
  failed: ExclamationTriangle,
  client_mismatch: ExclamationTriangle,
};

const statusToColor = (theme: InternalTheme, status: Exclude<EmailLinkVerificationStatus, 'loading'>) =>
  ({
    verified: theme.colors.$success500,
    verified_switch_tab: theme.colors.$primary500,
    expired: theme.colors.$warning500,
    failed: theme.colors.$danger500,
    client_mismatch: theme.colors.$warning500,
  })[status];

export const EmailLinkStatusCard = (props: EmailLinkStatusCardProps) => {
  const card = useCardState();
  return (
    <Flow.Part part='emailLinkStatus'>
      <Card.Root>
        <Card.Content>
          <Header.Root>
            <Header.Title localizationKey={props.title} />
            <Header.Subtitle localizationKey={props.subtitle} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          <Col elementDescriptor={descriptors.main}>
            <StatusRow status={props.status} />
          </Col>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

const StatusRow = (props: { status: EmailLinkVerificationStatus }) => {
  return (
    <Flex
      elementDescriptor={descriptors.verificationLinkStatusBox}
      center
      direction='col'
      gap={8}
    >
      {props.status === 'loading' ? (
        <Spinner
          size='xl'
          colorScheme='primary'
          sx={theme => ({ margin: `${theme.space.$12} 0` })}
          elementDescriptor={descriptors.spinner}
        />
      ) : (
        <>
          <StatusIcon status={props.status} />
          <Text
            elementDescriptor={descriptors.verificationLinkStatusText}
            colorScheme='secondary'
            localizationKey={localizationKeys('signIn.emailLink.unusedTab.title')}
          />
        </>
      )}
    </Flex>
  );
};

const StatusIcon = (props: { status: Exclude<EmailLinkVerificationStatus, 'loading'> }) => {
  const { status } = props;

  return (
    <Flex
      elementDescriptor={descriptors.verificationLinkStatusIconBox}
      center
      sx={theme => ({
        width: theme.sizes.$24,
        height: theme.sizes.$24,
        borderRadius: theme.radii.$circle,
        backgroundColor: theme.colors.$neutralAlpha100,
        color: statusToColor(theme, status),
        animation: `${animations.dropdownSlideInScaleAndFade} 500ms ease`,
      })}
    >
      <Icon
        elementDescriptor={descriptors.verificationLinkStatusIcon}
        icon={StatusToIcon[status]}
        sx={theme => ({ height: theme.sizes.$6, width: theme.sizes.$5 })}
      />
    </Flex>
  );
};
