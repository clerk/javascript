import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import type { LocalizationKey } from '@/ui/customizables';
import { descriptors, Flex, Grid, SimpleButton, Spinner, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import type { InternalTheme, PropsOfComponent } from '@/ui/styledSystem';

import { getEnterpriseProviderIconId, ProviderIcon } from './ProviderIcon';

type ChooseEnterpriseConnectionCardProps = {
  title: LocalizationKey;
  subtitle: LocalizationKey;
  onClick: (id: string) => Promise<void>;
  enterpriseConnections: Array<{ id: string; name: string; logoPublicUrl?: string | null; provider?: string }>;
};

/**
 * @experimental
 */
export const ChooseEnterpriseConnectionCard = ({
  title,
  subtitle,
  onClick,
  enterpriseConnections,
  children,
}: PropsWithChildren<ChooseEnterpriseConnectionCardProps>) => {
  const card = useCardState();

  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={title} />
          <Header.Subtitle localizationKey={subtitle} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>

        <Grid
          elementDescriptor={descriptors.enterpriseConnectionsRoot}
          gap={2}
        >
          {enterpriseConnections?.map(({ id, name, logoPublicUrl, provider }) => (
            <ChooseEnterpriseConnectionButton
              key={id}
              id={id}
              label={name}
              logoPublicUrl={logoPublicUrl}
              provider={provider}
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

type ChooseEnterpriseConnectionButtonProps = Omit<PropsOfComponent<typeof SimpleButton>, 'onClick'> & {
  id: string;
  label: string;
  logoPublicUrl?: string | null;
  provider?: string;
  onClick: (id: string) => Promise<void>;
};

const ChooseEnterpriseConnectionButton = (props: ChooseEnterpriseConnectionButtonProps): JSX.Element => {
  const { label, logoPublicUrl, provider, onClick, ...rest } = props;
  const providerIconId = provider ? getEnterpriseProviderIconId(provider) : undefined;
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    void onClick(props.id).catch(() => setIsLoading(false));
  };

  return (
    <SimpleButton
      elementDescriptor={descriptors.enterpriseConnectionButton}
      variant='outline'
      block
      isLoading={isLoading}
      hoverAsFocus
      onClick={handleClick}
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
        <Flex
          as='span'
          center
          sx={(theme: InternalTheme) => ({ flex: `0 0 ${theme.space.$4}` })}
        >
          {isLoading ? (
            <Spinner
              size='sm'
              elementDescriptor={descriptors.spinner}
            />
          ) : (
            <ProviderIcon
              id={providerIconId}
              iconUrl={logoPublicUrl}
              name={label}
              alt={`${label}'s icon`}
              elementDescriptor={[descriptors.providerIcon, descriptors.enterpriseButtonsProviderIcon]}
              elementId={descriptors.providerIcon.setId(providerIconId)}
            />
          )}
        </Flex>
        <Text
          elementDescriptor={descriptors.enterpriseConnectionButtonText}
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
