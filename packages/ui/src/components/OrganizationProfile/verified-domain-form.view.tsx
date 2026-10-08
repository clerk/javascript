import { CalloutWithAction } from '@/common';
import { Col, descriptors, Flex, localizationKeys, Spinner, Text } from '@/customizables';
import { InformationCircle } from '@/icons';
import { Alert } from '@/ui/elements/Alert';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Header } from '@/ui/elements/Header';

import type { VerifiedDomainFormData } from './verified-domain-form.types';

export const VerifiedDomainFormView = ({
  controller,
  onReset,
}: {
  controller: VerifiedDomainFormData;
  onReset: FormProps['onReset'];
}) => {
  if (controller.isLoading) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={{ height: '100%' }}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  if (controller.errorMessage) {
    return (
      <Form.Root onSubmit={controller.retry}>
        <Alert
          variant='danger'
          subtitle={controller.errorMessage}
        />
        <FormButtons
          onReset={onReset}
          submitLabel={localizationKeys('formButtonPrimary')}
        />
      </Form.Root>
    );
  }

  return (
    <FormContainer
      headerTitle={localizationKeys('organizationProfile.verifiedDomainPage.title', {
        domain: controller.domainName,
      })}
      headerSubtitle={
        controller.allowsEdit
          ? undefined
          : localizationKeys('organizationProfile.verifiedDomainPage.subtitle', { domain: controller.domainName })
      }
      gap={4}
    >
      <Col gap={6}>
        {controller.calloutLabels.length > 0 && (
          <CalloutWithAction icon={InformationCircle}>
            {controller.calloutLabels.map(label => (
              <Text
                key={label.key}
                as={'span'}
                sx={{ display: 'block' }}
                localizationKey={label}
              />
            ))}
          </CalloutWithAction>
        )}
        <Header.Root>
          <Header.Subtitle
            localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.subtitle')}
            variant='subtitle'
          />
        </Header.Root>
        <Form.Root
          onSubmit={controller.updateEnrollmentMode}
          gap={6}
        >
          <Form.ControlRow elementId={controller.enrollmentMode.id}>
            <Form.RadioGroup {...controller.enrollmentMode.props} />
          </Form.ControlRow>

          {controller.allowsEdit && controller.enrollmentMode.value === 'manual_invitation' && (
            <Form.ControlRow elementId={controller.deletePending.id}>
              <Form.Checkbox {...controller.deletePending.props} />
            </Form.ControlRow>
          )}

          <FormButtons onReset={onReset} />
        </Form.Root>
      </Col>
    </FormContainer>
  );
};
