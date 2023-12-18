import { useOrganization } from '@clerk/shared/react';
import type {
  GetDomainsParams,
  OrganizationDomainResource,
  OrganizationDomainVerificationStatus,
  OrganizationEnrollmentMode,
} from '@clerk/types';
import React, { useMemo } from 'react';

import { useGate, withGate } from '../../common';
import { Box, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { ProfileSection, ThreeDotsMenu } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useInView } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { EnrollmentBadge } from './EnrollmentBadge';
import { RemoveDomainForm } from './RemoveDomainForm';
import { VerifiedDomainForm } from './VerifiedDomainForm';
import { VerifyDomainForm } from './VerifyDomainForm';

type DomainListProps = GetDomainsParams & {
  verificationStatus?: OrganizationDomainVerificationStatus;
  enrollmentMode?: OrganizationEnrollmentMode;
  /**
   * Enables internal links to navigate to the correct page
   * based on when this component is used
   */
  redirectSubPath: 'organization-settings/domain' | 'domain';
  fallback?: React.ReactNode;
};

const useMenuActions = (domain: OrganizationDomainResource): PropsOfComponent<typeof ThreeDotsMenu>['actions'] => {
  const { open } = useActionContext();

  const menuActions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [];

  if (domain.verification && domain.verification.status === 'verified') {
    menuActions.push({
      label: localizationKeys('organizationProfile.general.domainSection.menuAction__manage'),
      onClick: () => open('manage'),
    });
  } else {
    menuActions.push({
      label: localizationKeys('organizationProfile.general.domainSection.menuAction__verify'),
      onClick: () => open('verify'),
    });
  }

  menuActions.push({
    label: localizationKeys('organizationProfile.general.domainSection.menuAction__remove'),
    isDestructive: true,
    onClick: () => open('remove'),
  });

  return menuActions;
};

type DomainListMenuProps = { domain: OrganizationDomainResource };
const DomainListMenu = ({ domain }: DomainListMenuProps) => {
  const actions = useMenuActions(domain);
  return <ThreeDotsMenu actions={actions} />;
};

export const DomainList = withGate(
  (props: DomainListProps) => {
    const { verificationStatus, enrollmentMode, redirectSubPath, fallback, ...rest } = props;
    const { organization, domains } = useOrganization({
      domains: {
        infinite: true,
        ...rest,
      },
    });

    const { isAuthorizedUser: canManageDomain } = useGate({ permission: 'org:sys_domains:manage' });
    const { ref } = useInView({
      threshold: 0,
      onChange: inView => {
        if (inView) {
          void domains?.fetchNext?.();
        }
      },
    });

    const domainList = useMemo(() => {
      if (!domains?.data) {
        return [];
      }

      return domains.data.filter(d => {
        let matchesStatus = true;
        let matchesMode = true;
        if (verificationStatus) {
          matchesStatus = !!d.verification && d.verification.status === verificationStatus;
        }
        if (enrollmentMode) {
          matchesMode = d.enrollmentMode === enrollmentMode;
        }

        return matchesStatus && matchesMode;
      });
    }, [domains?.data]);

    if (!organization) {
      return null;
    }

    return (
      <ProfileSection.ItemList id='organizationDomains'>
        {domainList.length === 0 && !domains?.isLoading && fallback}
        {domainList.map(domain => {
          return (
            <Action.Root key={domain.id}>
              <ProfileSection.Item id='organizationDomains'>
                <Flex sx={t => ({ gap: t.space.$1 })}>
                  <Text>{domain.name}</Text>
                  <EnrollmentBadge organizationDomain={domain} />
                </Flex>

                {canManageDomain && <DomainListMenu domain={domain} />}
              </ProfileSection.Item>

              <Action.Open value='remove'>
                <Action.Card>
                  <RemoveDomainForm domainId={domain.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='verify'>
                <Action.Card>
                  <VerifyDomainForm domainId={domain.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='manage'>
                <Action.Card>
                  <VerifiedDomainForm domainId={domain.id} />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          );
        })}

        {(domains?.hasNextPage || domains?.isFetching) && domains.data.length === 0 && (
          <Box
            ref={domains?.isFetching ? undefined : ref}
            sx={[
              t => ({
                width: '100%',
                height: t.space.$10,
                position: 'relative',
              }),
            ]}
          >
            <Box
              sx={{
                display: 'flex',
                margin: 'auto',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translateY(-50%) translateX(-50%)',
              }}
            >
              <Spinner
                size='sm'
                colorScheme='primary'
                elementDescriptor={descriptors.spinner}
              />
            </Box>
          </Box>
        )}
      </ProfileSection.ItemList>
    );
  },
  {
    permission: 'org:sys_domains:read',
  },
);
