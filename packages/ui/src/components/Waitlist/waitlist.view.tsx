import type { FormEventHandler } from 'react';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { Header } from '@/ui/elements/Header';
import type { FormControlState } from '@/ui/utils/useFormControl';

import { Wizard } from '../../common';
import { Col, descriptors, Flex, Flow, Icon, localizationKeys, Text } from '../../customizables';
import { Spinner } from '../../icons';
import { animations } from '../../styledSystem';

export type WaitlistViewProps = {
  step: number;
  emailAddressProps: FormControlState<'emailAddress'>['props'];
  error: string | undefined;
  onSubmit: FormEventHandler<HTMLFormElement>;
  signInHref: string;
  hasAfterJoinWaitlistUrl: boolean;
};

export function WaitlistView({
  step,
  emailAddressProps,
  error,
  onSubmit,
  signInHref,
  hasAfterJoinWaitlistUrl,
}: WaitlistViewProps) {
  return (
    <Flow.Root flow='waitlist'>
      <Card.Root>
        <Card.Content>
          <Wizard step={step}>
            <Col gap={6}>
              <Header.Root showLogo>
                <Header.Title localizationKey={localizationKeys('waitlist.start.title')} />
                <Header.Subtitle localizationKey={localizationKeys('waitlist.start.subtitle')} />
              </Header.Root>
              <Card.Alert>{error}</Card.Alert>
              <Flex
                direction='col'
                elementDescriptor={descriptors.main}
                gap={6}
              >
                <Form.Root
                  onSubmit={onSubmit}
                  gap={8}
                >
                  <Col gap={6}>
                    <Form.ControlRow elementId='emailAddress'>
                      <Form.PlainInput
                        {...emailAddressProps}
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
              {hasAfterJoinWaitlistUrl && (
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
                        icon={Spinner}
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
        </Card.Content>
        <Card.Footer>
          <Card.Action elementId='waitlist'>
            <Card.ActionText localizationKey={localizationKeys('waitlist.start.actionText')} />
            <Card.ActionLink
              localizationKey={localizationKeys('waitlist.start.actionLink')}
              to={signInHref}
            />
          </Card.Action>
        </Card.Footer>
      </Card.Root>
    </Flow.Root>
  );
}
