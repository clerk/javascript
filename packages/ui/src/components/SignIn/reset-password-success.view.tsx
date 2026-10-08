import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import { Col, descriptors, localizationKeys, Spinner, Text } from '../../customizables';
import { Flex } from '../../primitives';
import type { useResetPasswordSuccessController } from './reset-password-success.controller';

export const ResetPasswordSuccessView = ({
  error,
}: ReturnType<typeof useResetPasswordSuccessController>): JSX.Element => (
  <Card.Root>
    <Card.Content>
      <Header.Root showLogo>
        <Header.Title localizationKey={localizationKeys('signIn.resetPassword.title')} />
      </Header.Root>
      <Card.Alert>{error}</Card.Alert>
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
