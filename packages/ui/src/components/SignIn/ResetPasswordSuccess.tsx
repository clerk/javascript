import { Card } from '@/ui/elements/Card';
import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, localizationKeys, Spinner, Text } from '../../customizables';
import { useSelectSessionWithTimeout } from '../../hooks/useSetSessionWithTimeout';
import { Flex } from '../../primitives';

const ResetPasswordSuccessInternal = () => {
  const card = useCardState();
  useSelectSessionWithTimeout();
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

export const ResetPasswordSuccess = withCardStateProvider(ResetPasswordSuccessInternal);
