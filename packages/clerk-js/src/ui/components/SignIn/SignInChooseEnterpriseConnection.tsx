import type { Button } from '@/ui/customizables';
import { descriptors, Flex, Flow, Grid, localizationKeys, SimpleButton, Spinner, Text } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';
import type { PropsOfComponent } from '@/ui/styledSystem';

export const SignInChooseEnterpriseConnection = () => {
  const card = useCardState();

  const handleEnterpriseSSO = () => {
    // TODO - Post sign-in with enterprise connection ID
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
            elementDescriptor={descriptors.chooseEnterpriseConnections}
            gap={2}
          >
            {mockEnterpriseConnections.map(({ id, name }) => (
              <ChooseEnterpriseConnectionButton
                key={id}
                id={id}
                label={name}
                onClick={handleEnterpriseSSO}
                isDisabled={card.isLoading}
              />
            ))}
          </Grid>
        </Card.Content>

        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

type ChooseEnterpriseConnectionButtonProps = PropsOfComponent<typeof Button> & {
  icon: React.ReactElement;
  id: string;
  label?: string;
  isLoading: boolean;
};

const ChooseEnterpriseConnectionButton = (props: ChooseEnterpriseConnectionButtonProps): JSX.Element => {
  const { icon, isLoading, label } = props;

  return (
    <SimpleButton
      elementDescriptor={descriptors.chooseEnterpriseConnectionButton}
      elementId={descriptors.chooseEnterpriseConnectionButton}
      variant='outline'
      block
      isLoading={isLoading}
      hoverAsFocus
      sx={theme => [
        {
          gap: theme.space.$4,
          position: 'relative',
          justifyContent: 'flex-start',
        },
        props.sx,
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
        {(isLoading || icon) && (
          <Flex
            as='span'
            center
            sx={theme => ({ flex: `0 0 ${theme.space.$4}` })}
          >
            {isLoading && (
              <Spinner
                size='sm'
                elementDescriptor={descriptors.spinner}
              />
            )}
          </Flex>
        )}
        <Text
          elementDescriptor={descriptors.chooseEnterpriseConnectionButtonText}
          elementId={descriptors.chooseEnterpriseConnectionButtonText}
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

// TODO - Replace with API response
const mockEnterpriseConnections = [
  {
    id: 1,
    name: 'Foo Corp 1',
  },
  {
    id: 2,
    name: 'Foo Corp 2',
  },
];
