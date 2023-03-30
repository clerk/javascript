import type { SignInResource } from '@clerk/types';
import React from 'react';

import type { LocalizationKey } from '../../../../dist/types/src/ui/localization';
import { Col, descriptors, localizationKeys } from '../../customizables';
import { Card, CardAlert, Footer, Form, Header, useCardState } from '../../elements';
import { handleError, useFormControl } from '../../utils';

type SAMLCardProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  handleEmailAddress: (emailAddress: string) => Promise<unknown>;
};

export const SAMLCard = (props: SAMLCardProps) => {
  const card = useCardState();

  const emailAddressField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    isRequired: true,
  });

  const handleSubmit = () => {
    return props
      .handleEmailAddress(emailAddressField.value)
      .catch(err => handleError(err, [emailAddressField], card.setError));
  };

  return (
    <Card>
      <CardAlert>{card.error}</CardAlert>

      <Header.Root>
        <Header.Title localizationKey={props.cardTitle} />
        <Header.Subtitle localizationKey={props.cardSubtitle} />
      </Header.Root>

      <Col
        elementDescriptor={descriptors.main}
        gap={8}
      >
        <Form.Root onSubmit={() => handleSubmit()}>
          <Form.ControlRow elementId={emailAddressField.id}>
            <Form.Control
              {...emailAddressField.props}
              autoFocus
            />
          </Form.ControlRow>

          <Form.SubmitButton>Continue</Form.SubmitButton>
        </Form.Root>
      </Col>

      {/*<Footer.Root>*/}
      {/*  <Footer.Action elementId='alternativeMethods'>*/}
      {/*    {props.onShowAlternativeMethodsClicked && (*/}
      {/*      <Footer.ActionLink*/}
      {/*        localizationKey={localizationKeys('footerActionLink__useAnotherMethod')}*/}
      {/*        onClick={props.onShowAlternativeMethodsClicked}*/}
      {/*      />*/}
      {/*    )}*/}
      {/*  </Footer.Action>*/}
      {/*  <Footer.Links/>*/}
      {/*</Footer.Root>*/}
    </Card>
  );
};
