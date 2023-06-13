import React from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Flow, Icon, localizationKeys, Text } from '../customizables';
import { useSupportEmail } from '../hooks/useSupportEmail';
import { Email } from '../icons';
import { CardAlert } from './Alert';
import { ArrowBlockButton } from './ArrowBlockButton';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Footer } from './Footer';
import { Header } from './Header';

type ErrorCardProps = {
  cardTitle?: LocalizationKey;
  cardSubtitle?: LocalizationKey;
  message?: LocalizationKey;
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
          <Header.Title localizationKey={props.cardTitle || 'Error'}></Header.Title>
          {props.cardSubtitle && <Header.Subtitle localizationKey={props.cardSubtitle} />}
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
              localizationKey={props.message}
            />
          )}
          {/*TODO: extract  */}
          <Text
            variant='smallRegular'
            colorScheme='neutral'
            localizationKey={localizationKeys('signIn.alternativeMethods.getHelp.content')}
          />
          <ArrowBlockButton
            textLocalizationKey={localizationKeys('signIn.alternativeMethods.getHelp.blockButton__emailSupport')}
            onClick={handleEmailSupport}
            leftIcon={
              <Icon
                icon={Email}
                sx={theme => ({ color: theme.colors.$blackAlpha500 })}
              />
            }
          />
        </Flex>
        <Footer.Root>
          <Footer.Action />
          <Footer.Links />
        </Footer.Root>
      </Card>
    </Flow.Part>
  );
};
