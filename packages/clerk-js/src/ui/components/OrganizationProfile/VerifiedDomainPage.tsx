import type { OrganizationEnrollmentMode } from '@clerk/types';

import { useCoreOrganization, useEnvironment } from '../../contexts';
import { Badge, Col, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import {
  BlockWithAction,
  ContentPage,
  Form,
  FormButtons,
  Header,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { useFetch } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const VerifiedDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organizationSettings } = useEnvironment();
  const { organization } = useCoreOrganization();
  const { params, navigate } = useRouter();

  const title = localizationKeys('organizationProfile.verifiedDomainPage.title');

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

  const updateEnrollmentMode = async () => {
    if (!domain || !organization) {
      return;
    }

    try {
      await domain.update({
        enrollmentMode: enrollmentMode.value as OrganizationEnrollmentMode,
      });

      await navigate('../../');
    } catch (e) {
      handleError(e, [enrollmentMode], card.setError);
    }
  };

  if (!organization || !organizationSettings) {
    return null;
  }

  const enrollmentMode = useFormControl('enrollmentMode', '', {
    type: 'radio',
    // TODO: Add labels
    radioOptions: [
      ...(organizationSettings.domains.enrollmentModes.includes('manual_invitation')
        ? [
            {
              value: 'manual_invitation',
              label: 'Manual invitation',
            },
          ]
        : []),
      ...(organizationSettings.domains.enrollmentModes.includes('automatic_invitation')
        ? [
            {
              value: 'automatic_invitation',
              label: 'Automatic invitation',
            },
          ]
        : []),
      ...(organizationSettings.domains.enrollmentModes.includes('automatic_suggestion')
        ? [
            {
              value: 'automatic_suggestion',
              label: 'Automatic suggestion',
            },
          ]
        : []),
    ],
  });

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

  return (
    <ContentPage
      headerTitle={title}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <BlockWithAction
        elementDescriptor={descriptors.accordionTriggerButton}
        badge={<Badge textVariant={'extraSmallRegular'}>Verified</Badge>}
        sx={t => ({
          backgroundColor: t.colors.$blackAlpha50,
          padding: `${t.space.$3} ${t.space.$4}`,
          minHeight: t.sizes.$10,
        })}
        actionSx={t => ({
          color: t.colors.$danger500,
        })}
        actionLabel={localizationKeys('organizationProfile.verifiedDomainPage.actionLabel__remove')}
        onActionClick={() => navigate(`../../domain/${domain.id}/remove`)}
      >
        {domain.name}
      </BlockWithAction>

      <Col gap={2}>
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.formTitle')}
            textVariant='largeMedium'
          />
          <Header.Subtitle
            localizationKey={localizationKeys('organizationProfile.verifiedDomainPage.formSubtitle')}
            variant='regularRegular'
          />
        </Header.Root>

        <Form.Root onSubmit={updateEnrollmentMode}>
          <Form.ControlRow elementId={enrollmentMode.id}>
            <Form.Control {...enrollmentMode.props} />
          </Form.ControlRow>

          <FormButtons isDisabled={domainStatus.isLoading || !domain} />
        </Form.Root>
      </Col>
    </ContentPage>
  );
});
