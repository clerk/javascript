import type { LocalizationKey } from '../customizables';
import { Col, descriptors, localizationKeys } from '../customizables';
import { Card, CardAlert, Form, Header, useCardState } from '../elements';
import { handleError, useFormControl } from '../utils';

type SamlCardProps = {
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  handleSamlIdentifier: (samlIdentifier: string) => Promise<unknown>;
};

export const SamlCard = (props: SamlCardProps) => {
  const card = useCardState();

  const samlIdentifierField = useFormControl('emailAddress', '', {
    type: 'email',
    label: localizationKeys('formFieldLabel__emailAddress'),
    isRequired: true,
  });

  const handleSubmit = () => {
    return props
      .handleSamlIdentifier(samlIdentifierField.value)
      .catch(err => handleError(err, [samlIdentifierField], card.setError));
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
          <Form.ControlRow elementId={samlIdentifierField.id}>
            <Form.Control
              {...samlIdentifierField.props}
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
