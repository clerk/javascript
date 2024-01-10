import React from 'react';

import type { LocalizationKey } from '../customizables';
import { descriptors, Flex, Flow, Icon, localizationKeys, Text } from '../customizables';
import { useSupportEmail } from '../hooks/useSupportEmail';
import { Email } from '../icons';
import { useRouter } from '../router';
import { ArrowBlockButton } from './ArrowBlockButton';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Header } from './Header';

type ErrorCardProps = {
  cardTitle?: LocalizationKey;
  cardSubtitle?: LocalizationKey;
  message?: LocalizationKey;
  onBackLinkClick?: React.MouseEventHandler | undefined;
};

export const ErrorCard = (props: ErrorCardProps) => {
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  const goBack = () => {
    void navigate('../');
  };

  return (
    <Flow.Part part='havingTrouble'>
      <Card.Root>
        <Card.Content>
          <Card.Alert>{card.error}</Card.Alert>
          <Header.Root>
            <Header.Title localizationKey={props.cardTitle || 'Error'} />
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
                colorScheme='neutral'
                localizationKey={props.message}
              />
            )}
            {/*TODO: extract  */}
            <Text
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
          <Card.Action elementId='alternativeMethods'>
            <Card.ActionLink
              localizationKey={localizationKeys('backButton')}
              onClick={goBack}
            />
          </Card.Action>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
