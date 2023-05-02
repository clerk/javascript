import { withRedirectToHomeSingleSessionGuard } from '../../common';
import { Col, descriptors, localizationKeys, Text } from '../../customizables';
import { Card, CardAlert, Header, useCardState, withCardStateProvider } from '../../elements';
import { useSetSessionWithTimeout } from '../../hooks/useSetSessionWithTimeout';
import { Flex, Spinner } from '../../primitives';

export const _ResetPasswordSuccess = () => {
  const card = useCardState();
  useSetSessionWithTimeout();
  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>
      <Header.Root>
        <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
      </Header.Root>
      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <Text
          localizationKey={localizationKeys('signIn.resetPassword.successMessage')}
          variant='smallRegular'
          colorScheme='inherit'
        />
        <Flex
          direction='row'
          center
        >
          <Spinner
            size='xl'
            colorScheme='primary'
          />
        </Flex>
      </Col>
    </Card>
  );
};

export const ResetPasswordSuccess = withRedirectToHomeSingleSessionGuard(withCardStateProvider(_ResetPasswordSuccess));
