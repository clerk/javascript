import React from 'react';

import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { descriptors, Flex, Flow, Icon, Text } from '../customizables';
import { Email } from '../icons';
import { CardAlert } from './Alert';
import { ArrowBlockButton } from './ArrowBlockButton';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Header } from './Header';

type ErrorCardProps = {
  cardTitle?: string;
  cardSubtitle?: string;
  message?: string;
  onBackLinkClick?: React.MouseEventHandler | undefined;
};

export const ErrorCard = (props: ErrorCardProps) => {
  const { onBackLinkClick } = props;
  const card = useCardState();
  const supportEmail = useSupportEmail();

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <Flow.Part part='havingTrouble'>
      <Card>
        <CardAlert>{card.error}</CardAlert>
        <Header.Root>
          {onBackLinkClick && <Header.BackLink onClick={onBackLinkClick} />}
          <Header.Title>{props.cardTitle || 'Error'}</Header.Title>
          {props.cardSubtitle && <Header.Subtitle>{props.cardSubtitle}</Header.Subtitle>}
        </Header.Root>
        {/*TODO: extract main in its own component */}
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={4}
        >
          {props.message && (
            <Text
              variant='smallRegular'
              colorScheme='neutral'
            >
              {props.message}
            </Text>
          )}
          {/*TODO: extract  */}
          <Text
            variant='smallRegular'
            colorScheme='neutral'
          >
            If you’re experiencing difficulty signing into your account, email us and we will work with you to restore
            access as soon as possible.
          </Text>
          <ArrowBlockButton
            onClick={handleEmailSupport}
            icon={
              <Icon
                icon={Email}
                sx={theme => ({ color: theme.colors.$blackAlpha500 })}
              />
            }
          >
            Email support
          </ArrowBlockButton>
        </Flex>
        <Footer.Root>
          <Footer.Action />
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};
