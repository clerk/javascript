import type { ComponentType } from 'react';

import { withRedirect } from '@/ui/common';
import { useCoreSignIn, useSignInContext } from '@/ui/contexts';
import { descriptors, Flex, Flow, Grid, localizationKeys, SimpleButton, Spinner, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import type { InternalTheme, PropsOfComponent } from '@/ui/styledSystem';
import type { AvailableComponentProps } from '@/ui/types';

import { hasMultipleEnterpriseConnections } from './shared';

/**
 * @experimental
 */
const SignInChooseEnterpriseConnectionInternal = () => {
  const signIn = useCoreSignIn();

  const card = useCardState();

  if (!hasMultipleEnterpriseConnections(signIn.supportedFirstFactors)) {
    // This should not happen due to the HOC guard, but provides type safety
    return null;
  }

  const enterpriseConnections = signIn.supportedFirstFactors.map(ff => ({
    id: ff.enterpriseConnectionId,
    name: ff.enterpriseConnectionName,
  }));

  const handleEnterpriseSSO = (connectionId: string) => {
    // TODO - Post sign-in with enterprise connection ID
    console.log('Signing in with enterprise connection:', connectionId);
  };

  return (
    <Flow.Part part='chooseEnterpriseConnection'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title localizationKey={localizationKeys('signIn.chooseEnterpriseConnection.title')} />
            <Header.Subtitle localizationKey={localizationKeys('signIn.chooseEnterpriseConnection.subtitle')} />
          </Header.Root>
          <Card.Alert>{card.error}</Card.Alert>

          <Grid
            elementDescriptor={descriptors.socialButtonsRoot}
            gap={2}
          >
            {enterpriseConnections.map(({ id, name }) => (
              <ChooseEnterpriseConnectionButton
                key={id}
                id={id}
                label={name}
                onClick={() => handleEnterpriseSSO(id)}
                isLoading={card.isLoading}
              />
            ))}
          </Grid>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

type ChooseEnterpriseConnectionButtonProps = PropsOfComponent<typeof SimpleButton> & {
  id: string;
  label?: string;
  isLoading: boolean;
  onClick: () => void;
};

const ChooseEnterpriseConnectionButton = (props: ChooseEnterpriseConnectionButtonProps): JSX.Element => {
  const { isLoading, label, onClick, ...rest } = props;

  return (
    <SimpleButton
      elementDescriptor={descriptors.chooseEnterpriseConnectionButton}
      variant='outline'
      block
      isLoading={isLoading}
      hoverAsFocus
      onClick={onClick}
      {...rest}
      sx={(theme: InternalTheme) => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
        },
        (rest as any).sx,
      ]}
    >
      <Flex
        justify='center'
        align='center'
        as='span'
        gap={3}
        sx={{
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <Flex
            as='span'
            center
            sx={(theme: InternalTheme) => ({ flex: `0 0 ${theme.space.$4}` })}
          >
            <Spinner
              size='sm'
              elementDescriptor={descriptors.spinner}
            />
          </Flex>
        )}
        <Text
          elementDescriptor={descriptors.chooseEnterpriseConnectionButtonText}
          as='span'
          truncate
          variant='buttonLarge'
        >
          {label}
        </Text>
      </Flex>
    </SimpleButton>
  );
};

const withEnterpriseConnectionsGuard = <P extends AvailableComponentProps>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const signIn = useCoreSignIn();
    const signInCtx = useSignInContext();

    return withRedirect(
      Component,
      () => !hasMultipleEnterpriseConnections(signIn.supportedFirstFactors),
      ({ clerk }) => signInCtx.signInUrl || clerk.buildSignInUrl(),
      'There are no enterprise connections available to sign-in. Clerk is redirecting to the `signInUrl` URL instead.',
    )(props);
  };

  HOC.displayName = `withEnterpriseConnectionsGuard(${displayName})`;

  return HOC;
};

export const SignInChooseEnterpriseConnection = withEnterpriseConnectionsGuard(
  SignInChooseEnterpriseConnectionInternal,
);
