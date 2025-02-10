import { Col, descriptors, localizationKeys, Spinner, Text } from '../../customizables';
import { Card, Header, useCardState, withCardStateProvider } from '../../elements';
import { useSetSessionWithTimeout } from '../../hooks/useSetSessionWithTimeout';
import { Flex } from '../../primitives';

export const _ResetPasswordSuccess = () => {
  const card = useCardState();
  useSetSessionWithTimeout();
  return (
    <Card.Root>
      <Card.Content>
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Col
          elementDescriptor={descriptors.main}
          gap={8}
        >
          <Text localizationKey={localizationKeys('signIn.resetPassword.successMessage')} />
          <Flex
            direction='row'
            center
          >
            <Spinner
              size='xl'
              colorScheme='primary'
              elementDescriptor={descriptors.spinner}
            />
          </Flex>
        </Col>
      </Card.Content>
      <Card.Footer />
    </Card.Root>
  );
};

export const ResetPasswordSuccess = withCardStateProvider(_ResetPasswordSuccess);
