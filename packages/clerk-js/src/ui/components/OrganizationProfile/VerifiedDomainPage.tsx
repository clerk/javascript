import type { OrganizationDomainResource, OrganizationEnrollmentMode } from '@clerk/types';

import { CalloutWithAction } from '../../common';
import { useCoreOrganization, useEnvironment } from '../../contexts';
import { Col, Flex, Icon, LocalizationKey, localizationKeys, Spinner, useLocalizations } from '../../customizables';
import {
  ContentPage,
  Form,
  FormButtons,
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
import { createListFormat, handleError, useFormControl } from '../../utils';
import { LinkButtonWithDescription } from '../UserProfile/LinkButtonWithDescription';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

const useCalloutLabel = (
  domain: OrganizationDomainResource | null,
  {
    prefix: prefixLocalKey,
    suffix: suffixLocalKey,
  }: {
    prefix: LocalizationKey;
    suffix: LocalizationKey;
  },
) => {
  const { locale, t } = useLocalizations();

  const totalInvitations = domain?.totalPendingInvitations || 0;
  const totalSuggestions = domain?.totalPendingSuggestions || 0;
  const totalPending = totalSuggestions + totalInvitations;

  if (totalPending <= 0) {
    return '';
  }

  const prefix = t(prefixLocalKey);

  const suffix = t(suffixLocalKey);
  const dynamicPart = [];

  if (totalInvitations) {
    dynamicPart.push(
      t(
        localizationKeys(
          `organizationProfile.verifiedDomainPage.enrollmentTab.calloutLabels.${
            totalInvitations > 1 ? 'pendingInvitationCount_many' : 'pendingInvitationCount_single'
          }`,
          { count: totalInvitations },
        ),
      ),
    );
  }

  if (totalSuggestions) {
    dynamicPart.push(
      t(
        localizationKeys(
          `organizationProfile.verifiedDomainPage.enrollmentTab.calloutLabels.${
            totalSuggestions > 1 ? 'pendingSuggestionCount_many' : 'pendingSuggestionCount_single'
          }`,
          { count: totalSuggestions },
        ),
      ),
    );
  }

  const dynamicPartText = createListFormat(dynamicPart, locale);

  return `${prefix} ${dynamicPartText} ${suffix}`;
};

export const VerifiedDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organizationSettings } = useEnvironment();
  const { organization } = useCoreOrganization();
  const { domains } = useCoreOrganization({
    domains: {
      infinite: true,
    },
  });

  const { navigateToFlowStart } = useNavigateToFlowStart();
  const { params, navigate, queryParams } = useRouter();
  const mode = (queryParams.mode || 'edit') as 'select' | 'edit';

  const breadcrumbTitle = localizationKeys('organizationProfile.profilePage.domainSection.title');
  const allowsEdit = mode === 'edit';

  const enrollmentMode = useFormControl('enrollmentMode', '', {
    type: 'radio',
    radioOptions: [
      ...(organizationSettings.domains.enrollmentModes.includes('manual_invitation')
        ? [
            {
              value: 'manual_invitation',
              label: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__label',
              ),
              description: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.manualInvitationOption__description',
              ),
            },
          ]
        : []),
      ...(organizationSettings.domains.enrollmentModes.includes('automatic_invitation')
        ? [
            {
              value: 'automatic_invitation',
              label: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__label',
              ),
              description: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.automaticInvitationOption__description',
              ),
            },
          ]
        : []),
      ...(organizationSettings.domains.enrollmentModes.includes('automatic_suggestion')
        ? [
            {
              value: 'automatic_suggestion',
              label: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__label',
              ),
              description: localizationKeys(
                'organizationProfile.verifiedDomainPage.enrollmentTab.automaticSuggestionOption__description',
              ),
            },
          ]
        : []),
    ],
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
    prefix: localizationKeys(
      `organizationProfile.verifiedDomainPage.enrollmentTab.calloutLabels.${
        (domain?.totalPendingInvitations || 0) > 1 ? 'prefix_many' : 'prefix_single'
      }`,
    ),
    suffix: localizationKeys(`organizationProfile.verifiedDomainPage.enrollmentTab.calloutLabels.suffix`),
  });

  const dangerCalloutLabel = useCalloutLabel(domain, {
    prefix: localizationKeys(`organizationProfile.verifiedDomainPage.dangerTab.calloutLabels.prefix`),
    suffix: localizationKeys(
      `organizationProfile.verifiedDomainPage.dangerTab.calloutLabels.${
        (domain?.totalPendingSuggestions || 0) > 1 ? 'suffix_many' : 'suffix_single'
      }`,
    ),
  });

  const updateEnrollmentMode = async () => {
    if (!domain || !organization) {
      return;
    }

    try {
      await domain.updateEnrollmentMode({
        enrollmentMode: enrollmentMode.value as OrganizationEnrollmentMode,
        deletePending: deletePending.checked,
      });

      await (domains as any).unstable__mutate();

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
        />
      </Flex>
    );
  }

  if (!(domain.verification && domain.verification.status === 'verified')) {
    void navigateToFlowStart();
  }

  return (
    <ContentPage
      headerTitle={domain.name}
      headerSubtitle={allowsEdit ? undefined : subtitle}
      breadcrumbTitle={breadcrumbTitle}
      gap={4}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <Col gap={6}>
        <Tabs>
          <TabsList>
            <Tab
              localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.start.headerTitle__enrollment')}
            />
            {allowsEdit && (
              <Tab
                localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.start.headerTitle__danger')}
              />
            )}
          </TabsList>
          <TabPanels>
            <TabPanel
              sx={{ width: '100%' }}
              direction={'col'}
              gap={4}
            >
              {calloutLabel && (
                <CalloutWithAction
                  text={calloutLabel}
                  icon={
                    <Icon
                      colorScheme='neutral'
                      icon={InformationCircle}
                      sx={t => ({ marginTop: t.space.$1 })}
                    />
                  }
                />
              )}
              <Header.Root>
                <Header.Subtitle
                  localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.enrollmentTab.subtitle')}
                  variant='regularRegular'
                />
              </Header.Root>
              <Form.Root
                onSubmit={updateEnrollmentMode}
                gap={6}
              >
                <Form.ControlRow elementId={enrollmentMode.id}>
                  <Form.Control {...enrollmentMode.props} />
                </Form.ControlRow>

                {allowsEdit && (
                  <Form.ControlRow elementId={deletePending.id}>
                    <Form.Control {...deletePending.props} />
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

            {allowsEdit && (
              <TabPanel
                direction={'col'}
                gap={4}
                sx={{ width: '100%' }}
              >
                {dangerCalloutLabel && (
                  <CalloutWithAction
                    text={dangerCalloutLabel}
                    icon={
                      <Icon
                        colorScheme='neutral'
                        icon={InformationCircle}
                        sx={t => ({ marginTop: t.space.$1 })}
                      />
                    }
                  />
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
                    colorScheme='danger'
                    onClick={() => navigate(`../../domain/${domain.id}/remove`)}
                  />
                </Col>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </ContentPage>
  );
});
