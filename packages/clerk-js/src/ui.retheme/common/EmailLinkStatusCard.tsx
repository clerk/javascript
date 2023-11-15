import React from 'react';

import type { VerificationStatus } from '../../utils/getClerkQueryParam';
import type { LocalizationKey } from '../customizables';
import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Spinner, Text } from '../customizables';
import { Card, CardAlert, Header } from '../elements';
import { useCardState } from '../elements/contexts';
import { ExclamationTriangle, SwitchArrows, TickShield } from '../icons';
import type { InternalTheme } from '../styledSystem';
import { animations } from '../styledSystem';

type EmailLinkStatusCardProps = React.PropsWithChildren<{
  title: LocalizationKey;
  subtitle: LocalizationKey;
  status: VerificationStatus;
}>;

const StatusToIcon: Record<Exclude<VerificationStatus, 'loading'>, React.ComponentType> = {
  verified: TickShield,
  verified_switch_tab: SwitchArrows,
  expired: ExclamationTriangle,
  failed: ExclamationTriangle,
};

const statusToColor = (theme: InternalTheme, status: Exclude<VerificationStatus, 'loading'>) =>
  ({
    verified: theme.colors.$success500,
    verified_switch_tab: theme.colors.$primary500,
    expired: theme.colors.$warning500,
    failed: theme.colors.$danger500,
  }[status]);

export const EmailLinkStatusCard = (props: EmailLinkStatusCardProps) => {
  const card = useCardState();
  return (
    <Flow.Part part='emailLinkStatus'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          <Header.Title localizationKey={props.title} />
          <Header.Subtitle localizationKey={props.subtitle} />
        </Header.Root>
        <Col elementDescriptor={descriptors.main}>
          <StatusRow status={props.status} />
        </Col>
      </Card>
    </Flow.Part>
  );
};

const StatusRow = (props: { status: VerificationStatus }) => {
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
        />
      ) : (
        <>
          <StatusIcon status={props.status} />
          <Text
            elementDescriptor={descriptors.verificationLinkStatusText}
            variant='regularRegular'
            colorScheme='neutral'
            localizationKey={localizationKeys('signIn.emailLink.unusedTab.title')}
          />
        </>
      )}
    </Flex>
  );
};

const StatusIcon = (props: { status: Exclude<VerificationStatus, 'loading'> }) => {
  const { status } = props;

  return (
    <Flex
      elementDescriptor={descriptors.verificationLinkStatusIconBox}
      center
      sx={theme => ({
        width: theme.sizes.$24,
        height: theme.sizes.$24,
        borderRadius: theme.radii.$circle,
        backgroundColor: theme.colors.$blackAlpha100,
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
