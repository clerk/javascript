import type { MouseEventHandler } from 'react';
import React from 'react';

import type { LocalizationKey } from '../customizables';
import { Button, descriptors, Flex, Flow, localizationKeys, Text } from '../customizables';
import { useSupportEmail } from '../hooks/useSupportEmail';
import { useRouter } from '../router';
import { Card } from './Card';
import { useCardState } from './contexts';
import { Header } from './Header';

type ErrorCardProps = {
  cardTitle?: LocalizationKey;
  cardSubtitle?: LocalizationKey;
  message?: LocalizationKey;
  onBackLinkClick?: React.MouseEventHandler | undefined;
  shouldNavigateBack?: boolean;
};

export const ErrorCard = (props: ErrorCardProps) => {
  const { shouldNavigateBack = true } = props;
  const card = useCardState();
  const { navigate } = useRouter();
  const supportEmail = useSupportEmail();

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  const goBack: MouseEventHandler = e => {
    if (props.onBackLinkClick) {
      return props.onBackLinkClick(e);
    }
    if (shouldNavigateBack) {
      void navigate('../');
    }
  };

  return (
    <Flow.Part part='havingTrouble'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={props.cardTitle || 'Error'} />
            {props.cardSubtitle && <Header.Subtitle localizationKey={props.cardSubtitle} />}
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={4}
          >
            {props.message && (
              <Text
                colorScheme='secondary'
                localizationKey={props.message}
              />
            )}
            <Button
              localizationKey={localizationKeys('signIn.alternativeMethods.getHelp.blockButton__emailSupport')}
              onClick={handleEmailSupport}
              hasArrow
            />
            {shouldNavigateBack ? (
              <Card.Action elementId='alternativeMethods'>
                <Card.ActionLink
                  localizationKey={localizationKeys('backButton')}
                  onClick={goBack}
                />
              </Card.Action>
            ) : null}
          </Flex>
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};
