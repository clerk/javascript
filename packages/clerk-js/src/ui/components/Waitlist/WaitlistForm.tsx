import { useWaitlist } from '@clerk/shared/react';
import type { JoinWaitlistParams } from '@clerk/types';

import { useWizard, Wizard } from '../../common';
import { Col, descriptors, Flex, localizationKeys } from '../../customizables';
import { Card, Form, Header, useCardState } from '../../elements';
import type { FormControlState } from '../../utils';
import { handleError } from '../../utils';
import type { Fields } from './Waitlist';

type WaitlistFormProps = {
  formState: Record<keyof Fields, FormControlState<any>>;
};

export const WaitlistForm = (props: WaitlistFormProps) => {
  const card = useCardState();
  const { formState } = props;
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const { joinWaitlist } = useWaitlist();

  const fields: Fields = {
    emailAddress: {
      required: true,
    },
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    card.setLoading();
    card.setError(undefined);

    try {
      const joinWaitlistParams: JoinWaitlistParams = { emailAddress: formState.emailAddress.value };

      const data = await joinWaitlist(joinWaitlistParams);

      console.log(data);

      wizard.nextStep();
    } catch (error) {
      handleError(error, [], card.setError);
    }
  };

  return (
    <Wizard {...wizard.props}>
      <Col gap={6}>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('waitlist.start.title')} />
          <Header.Subtitle localizationKey={localizationKeys('waitlist.start.subtitle')} />
        </Header.Root>
        <Card.Alert>{card.error}</Card.Alert>
        <Flex
          direction='col'
          elementDescriptor={descriptors.main}
          gap={6}
        >
          <Form.Root
            onSubmit={handleSubmit}
            gap={8}
          >
            <Col gap={6}>
              <Form.ControlRow elementId='emailAddress'>
                <Form.PlainInput
                  {...formState.emailAddress.props}
                  isRequired={fields.emailAddress!.required}
                  isOptional={!fields.emailAddress!.required}
                  isDisabled={fields.emailAddress!.disabled}
                />
              </Form.ControlRow>
            </Col>
            <Col center>
              <Form.SubmitButton localizationKey={localizationKeys('waitlist.start.formButton')} />
            </Col>
          </Form.Root>
        </Flex>
      </Col>
      <Col gap={6}>
        <Header.Root>
          <Header.Title localizationKey={localizationKeys('waitlist.success.title')} />
          <Header.Subtitle localizationKey={localizationKeys('waitlist.success.subtitle')} />
        </Header.Root>
      </Col>
    </Wizard>
  );
};
