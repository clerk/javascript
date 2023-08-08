import type { OrganizationDomainResource } from '@clerk/types';
import React, { useEffect } from 'react';

import { RemoveResourcePage } from '../../common';
import { useCoreOrganization } from '../../contexts';
import { Flex, Spinner } from '../../customizables';
import { useLoadingStatus } from '../../hooks';
import { localizationKeys } from '../../localization';
import { useRouter } from '../../router';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

export const RemoveDomainPage = () => {
  const { organization } = useCoreOrganization();
  const { params } = useRouter();

  const [domain, setDomain] = React.useState<OrganizationDomainResource | null>(null);
  let ref = React.useRef<OrganizationDomainResource>();
  const domainStatus = useLoadingStatus({
    status: 'loading',
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
        ref.current = { ...domain };
      })
      .catch(() => {
        domainStatus.setError();
        setDomain(null);
      });
  }, [params.id]);

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
    <RemoveResourcePage
      title={localizationKeys('organizationProfile.removeDomainPage.title')}
      messageLine1={localizationKeys('organizationProfile.removeDomainPage.messageLine1', {
        domain: ref.current?.name,
      })}
      messageLine2={localizationKeys('organizationProfile.removeDomainPage.messageLine2')}
      successMessage={localizationKeys('organizationProfile.removeDomainPage.successMessage', {
        domain: ref.current?.name,
      })}
      deleteResource={() => Promise.resolve(domain?.delete())}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    />
  );
};
