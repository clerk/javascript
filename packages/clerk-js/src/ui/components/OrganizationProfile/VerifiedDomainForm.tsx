import { useOrganization } from '@clerk/shared/react';
import type {
  OrganizationDomainResource,
  OrganizationEnrollmentMode,
  OrganizationSettingsResource,
} from '@clerk/types';

import { CalloutWithAction } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import type { FormProps } from '../../elements';
import { Form, FormButtons, FormContainer, Header, useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { InformationCircle } from '../../icons';
import { handleError, useFormControl } from '../../utils';

const useCalloutLabel = (
  domain: OrganizationDomainResource | undefined | null,
  {
    infoLabel: infoLabelKey,
  }: {
    infoLabel: LocalizationKey;
  },
) => {
  const totalInvitations = domain?.totalPendingInvitations || 0;
  const totalSuggestions = domain?.totalPendingSuggestions || 0;
  const totalPending = totalSuggestions + totalInvitations;

  if (totalPending === 0) {
    return [] as string[];
  }

  return [
    infoLabelKey,
    localizationKeys(`organizationProfile.verifiedDomainPage.enrollmentTab.calloutInvitationCountLabel`, {
      count: totalInvitations,
    }),
    localizationKeys(`organizationProfile.verifiedDomainPage.enrollmentTab.calloutSuggestionCountLabel`, {
      count: totalInvitations,
    }),
  ];
};

const buildEnrollmentOptions = (settings: OrganizationSettingsResource) => {
  const _options = [];
  if (settings.domains.enrollmentModes.includes('manual_invitation')) {
    _options.push({
      value: 'manual_invitation',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__description',
      ),
    });
  }

  if (settings.domains.enrollmentModes.includes('automatic_invitation')) {
    _options.push({
      value: 'automatic_invitation',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__description',
      ),
    });
  }

  if (settings.domains.enrollmentModes.includes('automatic_suggestion')) {
    _options.push({
      value: 'automatic_suggestion',
      label: localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__label'),
      description: localizationKeys(
        'organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__description',
      ),
    });
  }

  return _options;
};

const useEnrollmentOptions = () => {
  const { organizationSettings } = useEnvironment();
  return buildEnrollmentOptions(organizationSettings);
};

type VerifiedDomainFormProps = FormProps & {
  domainId: string;
  mode?: 'select' | 'edit';
};

export const VerifiedDomainForm = withCardStateProvider((props: VerifiedDomainFormProps) => {
  const { domainId: id, mode = 'edit', onSuccess, onReset } = props;
  const card = useCardState();
  const { organizationSettings } = useEnvironment();

  const { membership, organization, domains } = useOrganization({
    domains: {
      infinite: true,
    },
  });

  const allowsEdit = mode === 'edit';

  const enrollmentOptions = useEnrollmentOptions();
  const enrollmentMode = useFormControl('enrollmentMode', '', {
    type: 'radio',
    radioOptions: enrollmentOptions,
    isRequired: true,
  });

  const deletePending = useFormControl('deleteExistingInvitationsSuggestions', '', {
    label: localizationKeys('formFieldLabel__organizationDomainDeletePending'),
    type: 'checkbox',
  });

  const { data: domain, isLoading: domainIsLoading } = useFetch(
    organization?.getDomain,
    {
      domainId: id,
    },
    {
      onSuccess(d) {
        enrollmentMode.setValue(d.enrollmentMode);
      },
    },
  );

  const isFormDirty = deletePending.checked || domain?.enrollmentMode !== enrollmentMode.value;
  const title = localizationKeys('organizationProfile.verifiedDomainPage.title', {
    domain: domain?.name,
  });
  const subtitle = localizationKeys('organizationProfile.verifiedDomainPage.subtitle', {
    domain: domain?.name,
  });

  const calloutLabel = useCalloutLabel(domain, {
    infoLabel: localizationKeys(`organizationProfile.verifiedDomainPage.enrollmentTab.calloutInfoLabel`),
  });

  const updateEnrollmentMode = async () => {
    if (!domain || !organization || !membership || !domains) {
      return;
    }

    try {
      await domain.updateEnrollmentMode({
        enrollmentMode: enrollmentMode.value as OrganizationEnrollmentMode,
        deletePending: deletePending.checked,
      });

      await domains.revalidate();

      onSuccess();
    } catch (e) {
      handleError(e, [enrollmentMode], card.setError);
    }
  };

  if (!organization || !organizationSettings) {
    return null;
  }

  if (domainIsLoading || !domain) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={{
          height: '100%',
        }}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
        />
      </Flex>
    );
  }

  if (!(domain.verification && domain.verification.status === 'verified')) {
    onReset();
  }

  return (
    <FormContainer
      headerTitle={title}
      headerSubtitle={allowsEdit ? undefined : subtitle}
      gap={4}
    >
      <Col gap={6}>
        {calloutLabel.length > 0 && (
          <CalloutWithAction icon={InformationCircle}>
            {calloutLabel.map((label, index) => (
              <Text
                key={index}
                as={'span'}
                sx={{
                  display: 'block',
                }}
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
          onSubmit={updateEnrollmentMode}
          gap={6}
        >
          <Form.ControlRow elementId={enrollmentMode.id}>
            <Form.RadioGroup {...enrollmentMode.props} />
          </Form.ControlRow>

          {allowsEdit && (
            <Form.ControlRow elementId={deletePending.id}>
              <Form.Checkbox {...deletePending.props} />
            </Form.ControlRow>
          )}

          <FormButtons
            localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.formButton__save')}
            isDisabled={domainIsLoading || !domain || !isFormDirty}
            onReset={onReset}
          />
        </Form.Root>
      </Col>
    </FormContainer>
  );
});
