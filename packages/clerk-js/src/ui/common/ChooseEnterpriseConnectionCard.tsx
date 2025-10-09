import type { LocalizationKey } from '@/ui/customizables';
import { descriptors, Flex, Grid, SimpleButton, Spinner, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import type { InternalTheme, PropsOfComponent } from '@/ui/styledSystem';

type ChooseEnterpriseConnectionCardProps = {
  title: LocalizationKey;
  subtitle: LocalizationKey;
  onClick: (id: string) => void;
  enterpriseConnections: Array<{ id: string; name: string }>;
};

/**
 * @experimental
 */
export const ChooseEnterpriseConnectionCard = ({
  title,
  subtitle,
  onClick,
  enterpriseConnections,
}: ChooseEnterpriseConnectionCardProps) => {
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
          elementDescriptor={descriptors.chooseEnterpriseConnectionsRoot}
          gap={2}
        >
          {enterpriseConnections?.map(({ id, name }) => (
            <ChooseEnterpriseConnectionButton
              key={id}
              id={id}
              label={name}
              onClick={() => onClick(id)}
              isLoading={card.isLoading}
            />
          ))}
        </Grid>
      </Card.Content>

      <Card.Footer />
    </Card.Root>
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
