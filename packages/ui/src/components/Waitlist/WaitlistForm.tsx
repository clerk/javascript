import { useClerk } from '@clerk/shared/react';
import type { JoinWaitlistParams } from '@clerk/shared/types';

import { Card } from '@/ui/elements/Card';
import { useCardState } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import { handleError } from '@/ui/utils/errorHandler';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { useWizard, Wizard } from '../../common';
import { useWaitlistContext } from '../../contexts';
import { Col, descriptors, Flex, Icon, localizationKeys, Text } from '../../customizables';
import { useLoadingStatus } from '../../hooks';
import { SpinnerJumbo } from '../../icons';
import { useRouter } from '../../router';
import { animations } from '../../styledSystem';
import type { Fields } from './waitlistFormHelpers';

type WaitlistFormProps = {
  formState: Record<keyof Fields, FormControlState<any>>;
};

export const WaitlistForm = (props: WaitlistFormProps) => {
  const clerk = useClerk();
  const card = useCardState();
  const status = useLoadingStatus();
  const { navigate } = useRouter();
  const ctx = useWaitlistContext();
  const { formState } = props;
  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    status.setLoading();
    card.setLoading();
    card.setError(undefined);

    const joinWaitlistParams: JoinWaitlistParams = { emailAddress: formState.emailAddress.value };

    await clerk
      .joinWaitlist(joinWaitlistParams)
      .then(() => {
        wizard.nextStep();

        setTimeout(() => {
          if (ctx.afterJoinWaitlistUrl) {
            void navigate(ctx.afterJoinWaitlistUrl);
          }
        }, 2000);
        return;
      })
      .catch(error => {
        handleError(error, [formState.emailAddress], card.setError);
      })
      .finally(() => {
        status.setIdle();
        card.setIdle();
      });
  };

  return (
    <Wizard {...wizard.props}>
      <Col gap={6}>
        <Header.Root showLogo>
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
                  isRequired
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
        <Header.Root showLogo>
          <Header.Title localizationKey={localizationKeys('waitlist.success.title')} />
          <Header.Subtitle localizationKey={localizationKeys('waitlist.success.subtitle')} />
        </Header.Root>
        {ctx.afterJoinWaitlistUrl && (
          <Flex
            direction='col'
            elementDescriptor={descriptors.main}
            gap={6}
          >
            <Col center>
              <Flex
                gap={2}
                align='center'
              >
                <Icon
                  icon={SpinnerJumbo}
                  sx={t => ({
                    margin: 'auto',
                    width: t.sizes.$6,
                    height: t.sizes.$6,
                    animation: `${animations.spinning} 1s linear infinite`,
                  })}
                />
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys('waitlist.success.message')}
                />
              </Flex>
            </Col>
          </Flex>
        )}
      </Col>
    </Wizard>
  );
};
