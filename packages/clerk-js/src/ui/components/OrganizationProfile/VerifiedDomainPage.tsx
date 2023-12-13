import { useOrganization } from '@clerk/shared/react';
import type {
  OrganizationDomainResource,
  OrganizationEnrollmentMode,
  OrganizationSettingsResource,
} from '@clerk/types';

import { CalloutWithAction, useGate } from '../../common';
import { useEnvironment } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import {
  Form,
  FormButtons,
  FormContent,
  Header,
  Tab,
  TabPanel,
  TabPanels,
  Tabs,
  TabsList,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useFetch, useNavigateToFlowStart } from '../../hooks';
import { InformationCircle } from '../../icons';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { LinkButtonWithDescription } from '../UserProfile/LinkButtonWithDescription';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

const useCalloutLabel = (
  domain: OrganizationDomainResource | null,
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

export const VerifiedDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organizationSettings } = useEnvironment();

  const { membership, organization, domains } = useOrganization({
    domains: {
      infinite: true,
    },
  });

  const { isAuthorizedUser: canManageDomain } = useGate({ permission: 'org:sys_domains:manage' });

  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { params, navigate, queryParams } = useRouter();
  const mode = (queryParams.mode || 'edit') as 'select' | 'edit';

  const breadcrumbTitle = localizationKeys('organizationProfile.profilePage.domainSection.title');
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

  const { data: domain, status: domainStatus } = useFetch(
    organization?.getDomain,
    {
      domainId: params.id,
    },
    {
      onSuccess(d) {
        enrollmentMode.setValue(d.enrollmentMode);
      },
    },
  );

  const isFormDirty = deletePending.checked || domain?.enrollmentMode !== enrollmentMode.value;
  const subtitle = localizationKeys('organizationProfile.verifiedDomainPage.subtitle', {
    domain: domain?.name,
  });

  const calloutLabel = useCalloutLabel(domain, {
    infoLabel: localizationKeys(`organizationProfile.verifiedDomainPage.enrollmentTab.calloutInfoLabel`),
  });

  const dangerCalloutLabel = useCalloutLabel(domain, {
    infoLabel: localizationKeys(`organizationProfile.verifiedDomainPage.dangerTab.calloutInfoLabel`),
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

      await navigate('../../');
    } catch (e) {
      handleError(e, [enrollmentMode], card.setError);
    }
  };

  if (!organization || !organizationSettings) {
    return null;
  }

  if (domainStatus.isLoading || !domain) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
        sx={t => ({
          height: '100%',
          minHeight: t.sizes.$120,
        })}
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
    void navigateToFlowStart();
  }

  return (
    <FormContent
      headerTitle={domain.name}
      headerSubtitle={allowsEdit ? undefined : subtitle}
      breadcrumbTitle={breadcrumbTitle}
      gap={4}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <Col gap={6}>
        <Tabs>
          <TabsList>
            {canManageDomain && (
              <Tab
                localizationKey={localizationKeys(
                  'organizationProfile.verifiedDomainPage.start.headerTitle__enrollment',
                )}
              />
            )}
            {allowsEdit && canManageDomain && (
              <Tab
                localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.start.headerTitle__danger')}
              />
            )}
          </TabsList>
          <TabPanels>
            {canManageDomain && (
              <TabPanel
                sx={{ width: '100%' }}
                direction={'col'}
                gap={4}
              >
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
                    localizationKey={localizationKeys(
                      'organizationProfile.verifiedDomainPage.enrollmentTab.formButton__save',
                    )}
                    isDisabled={domainStatus.isLoading || !domain || !isFormDirty}
                  />
                </Form.Root>
              </TabPanel>
            )}
            {allowsEdit && canManageDomain && (
              <TabPanel
                direction={'col'}
                gap={4}
                sx={{ width: '100%' }}
              >
                {dangerCalloutLabel.length > 0 && (
                  <CalloutWithAction icon={InformationCircle}>
                    {dangerCalloutLabel.map((label, index) => (
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
                <Col
                  sx={t => ({
                    padding: `${t.space.$none} ${t.space.$4}`,
                  })}
                >
                  <LinkButtonWithDescription
                    title={localizationKeys('organizationProfile.verifiedDomainPage.dangerTab.removeDomainTitle')}
                    subtitle={localizationKeys('organizationProfile.verifiedDomainPage.dangerTab.removeDomainSubtitle')}
                    actionLabel={localizationKeys(
                      'organizationProfile.verifiedDomainPage.dangerTab.removeDomainActionLabel__remove',
                    )}
                    variant='linkDanger'
                    onClick={() => navigate(`../../domain/${domain.id}/remove`)}
                  />
                </Col>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </FormContent>
  );
});
