import { useOrganization } from '@clerk/shared/react';
import type { OrganizationDomainResource } from '@clerk/types';
import React from 'react';

import { RemoveResourcePage } from '../../common';
import { useEnvironment } from '../../contexts';
import { descriptors, Flex, Spinner } from '../../customizables';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useFetch } from '../../hooks';
import { localizationKeys } from '../../localization';
import { OrganizationProfileBreadcrumbs } from './OrganizationProfileNavbar';

type RemoveDomainFormProps = {
  domainId: string;
};

export const RemoveDomainForm = (props: RemoveDomainFormProps) => {
  const { organizationSettings } = useEnvironment();
  const { organization } = useOrganization();
  const { close } = useActionContext();
  const { domainId: id } = props;

  const ref = React.useRef<OrganizationDomainResource>();
  const { data: domain, status: domainStatus } = useFetch(
    organization?.getDomain,
    {
      domainId: id,
    },
    {
      onSuccess(domain) {
        ref.current = { ...domain };
      },
    },
  );

  const { domains } = useOrganization({
    domains: {
      infinite: true,
    },
  });

  if (!organization || !organizationSettings) {
    return null;
  }

  if (domainStatus.isLoading || !domain) {
    return (
      <Flex
        direction={'row'}
        align={'center'}
        justify={'center'}
      >
        <Spinner
          size={'lg'}
          colorScheme={'primary'}
          elementDescriptor={descriptors.spinner}
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
      deleteResource={() =>
        domain?.delete().then(async () => {
          await domains?.revalidate?.();
          close();
        })
      }
      breadcrumbTitle={localizationKeys('organizationProfile.profilePage.domainSection.title')}
      Breadcrumbs={OrganizationProfileBreadcrumbs}
    />
  );
};
