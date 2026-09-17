import { OAUTH_PROVIDERS } from '@clerk/shared/oauth';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import {
  descriptors,
  Flex,
  Grid,
  localizationKeys,
  SimpleButton,
  Spinner,
  Text,
  useLocalizations,
} from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { ProviderIcon } from './ProviderIcon';

type EnterpriseConnectionOption = {
  id: string;
  name?: string;
  provider?: string;
  logoPublicUrl?: string;
  organizationName?: string;
  domain?: string;
};

type ChooseEnterpriseConnectionCardProps = {
  flow: 'signIn' | 'signUp';
  onClick: (id: string) => Promise<void>;
  enterpriseConnections: EnterpriseConnectionOption[];
};

export const ChooseEnterpriseConnectionCard = ({
  flow,
  onClick,
  enterpriseConnections,
  children,
}: PropsWithChildren<ChooseEnterpriseConnectionCardProps>) => {
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys(`${flow}.enterpriseConnections.title`)} />
          <Header.Subtitle localizationKey={localizationKeys(`${flow}.enterpriseConnections.subtitle`)} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Grid
          elementDescriptor={descriptors.enterpriseConnectionsRoot}
          gap={2}
        >
          {enterpriseConnections.map(connection => (
            <ChooseEnterpriseConnectionButton
              key={connection.id}
              connection={connection}
              flow={flow}
              onClick={onClick}
            />
          ))}
        </Grid>
        {children}
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

const ChooseEnterpriseConnectionButton = ({
  connection,
  flow,
  onClick,
}: Pick<ChooseEnterpriseConnectionCardProps, 'flow' | 'onClick'> & { connection: EnterpriseConnectionOption }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocalizations();
  const providerKey = connection.provider?.replace(/^(saml|oauth)_/, '');
  const provider = OAUTH_PROVIDERS.find(p => p.provider === providerKey);
  const providerLabel =
    provider?.name ||
    (providerKey === 'okta' ? 'Okta' : t(localizationKeys(`${flow}.enterpriseConnections.connectionLabel`)));
  const label = connection.name?.trim() || providerLabel;
  const domain = connection.domain?.trim();
  const subtitle =
    connection.organizationName?.trim() ||
    (domain ? t(localizationKeys(`${flow}.enterpriseConnections.connectionSubtitle`, { domain })) : providerLabel);

  const handleClick = () => {
    setIsLoading(true);
    void onClick(connection.id).catch(() => setIsLoading(false));
  };

  return (
    <SimpleButton
      elementDescriptor={descriptors.enterpriseConnectionButton}
      aria-label={`${label} ${subtitle}`}
      variant='outline'
      block
      isLoading={isLoading}
      hoverAsFocus
      onClick={handleClick}
      sx={theme => ({ gap: theme.space.$3, justifyContent: 'flex-start', paddingBlock: theme.space.$2 })}
    >
      {isLoading ? (
        <Spinner
          size='sm'
          elementDescriptor={descriptors.spinner}
        />
      ) : (
        <ProviderIcon
          id={provider?.provider || 'custom_enterprise_sso'}
          iconUrl={connection.logoPublicUrl}
          name={label}
          size='$5'
          aria-hidden
          elementDescriptor={descriptors.enterpriseConnectionButtonIcon}
          sx={{ flexShrink: 0 }}
        />
      )}
      <Flex
        as='span'
        direction='col'
        align='start'
        sx={{ minWidth: 0 }}
      >
        <Text
          elementDescriptor={descriptors.enterpriseConnectionButtonText}
          as='span'
          truncate
          variant='buttonLarge'
        >
          {label}
        </Text>
        <Text
          elementDescriptor={descriptors.enterpriseConnectionButtonSubtitle}
          as='span'
          truncate
          variant='caption'
          colorScheme='secondary'
        >
          {subtitle}
        </Text>
      </Flex>
    </SimpleButton>
  );
};
