import type { OrganizationEnrollmentMode } from '@clerk/types';

import { useCoreOrganization, useEnvironment } from '../../contexts';
import { Col, Flex, localizationKeys, Spinner } from '../../customizables';
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
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { LinkButtonWithDescription } from '../UserProfile/LinkButtonWithDescription';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

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
                sx={[
                  { width: '100%' },
                  t => ({
                    padding: `${t.space.$none} ${t.space.$4}`,
                  }),
                ]}
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
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Col>
    </ContentPage>
  );
});
