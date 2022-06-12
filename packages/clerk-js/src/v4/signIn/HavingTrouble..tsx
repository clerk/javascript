import React from 'react';

import { useSupportEmail } from '../../ui/hooks/useSupportEmail';
import { descriptors, Flex, Icon, Text } from '../customizables';
import { BackLink, BlockButtonWithArrow, CardAlert, FlowCard, Footer, Header, withFlowCardContext } from '../elements';
import { useCardState } from '../elements/contexts';
import { Email } from '../icons';
import { AlternativeMethodsProps } from './AlternativeMethods';

export const HavingTrouble = withFlowCardContext(
  (props: Omit<AlternativeMethodsProps, 'onFactorSelected'>) => {
    const { onBackLinkClick } = props;
    const card = useCardState();
    const supportEmail = useSupportEmail();

    const handleEmailSupport = () => {
      window.location.href = `mailto:${supportEmail}`;
    };

    return (
      <FlowCard.OuterContainer>
        <FlowCard.Content>
          <CardAlert>{card.error}</CardAlert>
          <BackLink onClick={onBackLinkClick} />
          <Header.Root>
            <Header.Title>I'm having trouble</Header.Title>
          </Header.Root>
          {/*TODO: extract main in its own component */}
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={4}
            sx={theme => ({ marginTop: theme.space.$8 })}
          >
            {/*TODO: extract  */}
            <Text
              variant='hint'
              colorScheme='neutral'
            >
              If you’re experiencing difficulty signing into your account, email us and we will work with you to restore
              access as soon as possible.
            </Text>
            <BlockButtonWithArrow
              onClick={handleEmailSupport}
              icon={
                <Icon
                  icon={Email}
                  sx={theme => ({ color: theme.colors.$blackAlpha500 })}
                />
              }
            >
              Email support
            </BlockButtonWithArrow>
          </Flex>
          <Footer.Root>
            <Footer.Action />
            <Footer.Links />
          </Footer.Root>{' '}
        </FlowCard.Content>
      </FlowCard.OuterContainer>
    );
  },
  { flow: 'signIn', page: 'havingTrouble' },
);
