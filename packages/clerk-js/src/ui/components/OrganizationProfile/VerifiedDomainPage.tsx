import type { OrganizationDomainResource } from '@clerk/types';
import React, { useEffect } from 'react';

import { useCoreOrganization } from '../../contexts';
import { Badge, descriptors, Flex, localizationKeys, Spinner } from '../../customizables';
import { ArrowBlockButton, ContentPage, Form, FormButtons, useCardState, withCardStateProvider } from '../../elements';
import { useLoadingStatus } from '../../hooks';
import { useRouter } from '../../router';
import { handleError, useFormControl } from '../../utils';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const VerifiedDomainPage = withCardStateProvider(() => {
  const card = useCardState();
  const { organization } = useCoreOrganization();
  const { params, navigate } = useRouter();

  const [domain, setDomain] = React.useState<OrganizationDomainResource | null>(null);

  const title = localizationKeys('organizationProfile.verifiedDomainPage.title');
  const domainStatus = useLoadingStatus({
    status: 'loading',
  });

  const automaticInvitationsField = useFormControl('automaticInvitations', '', {
    type: 'checkbox',
    label: localizationKeys('formFieldLabel__automaticInvitations'),
  });

  useEffect(() => {
    domainStatus.setLoading();
    organization
      ?.getDomain?.({
        domainId: params.id,
      })
      .then(domain => {
        domainStatus.setIdle();
        setDomain(domain);
        automaticInvitationsField.setChecked(domain.enrollmentMode === 'automatic_invitation');
      })
      .catch(() => {
        setDomain(null);
        domainStatus.setError();
      });
  }, [params.id]);

  const updateEnrollmentMode = async () => {
    if (!domain || !organization) {
      return;
    }

    try {
      await domain.update({
        enrollmentMode: automaticInvitationsField.checked ? 'automatic_invitation' : 'manual_invitation',
      });

      await navigate('../../');
    } catch (e) {
      handleError(e, [automaticInvitationsField], card.setError);
    }
  };

  if (!organization) {
    return null;
  }

  if (domainStatus.isLoading || !domain) {
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
        />
      </Flex>
    );
  }

  return (
    <ContentPage
      headerTitle={title}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    >
      <ArrowBlockButton
        elementDescriptor={descriptors.accordionTriggerButton}
        variant='ghost'
        colorScheme='neutral'
        badge={<Badge textVariant={'extraSmallRegular'}>Verified</Badge>}
        sx={t => ({
          backgroundColor: t.colors.$blackAlpha50,
          padding: `${t.space.$3} ${t.space.$4}`,
          minHeight: t.sizes.$10,
        })}
        rightIconSx={{
          visibility: 'hidden',
        }}
      >
        {domain.name}
      </ArrowBlockButton>

      <Form.Root onSubmit={updateEnrollmentMode}>
        <Form.ControlRow elementId={automaticInvitationsField.id}>
          <Form.Control
            {...automaticInvitationsField.props}
            autoFocus
          />
        </Form.ControlRow>
        <FormButtons isDisabled={domainStatus.isLoading || !domain} />
      </Form.Root>
    </ContentPage>
  );
});
