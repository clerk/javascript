import { useOrganization } from '@clerk/shared/react';
import type {
  GetDomainsParams,
  OrganizationDomainResource,
  OrganizationDomainVerificationStatus,
  OrganizationEnrollmentMode,
} from '@clerk/shared/types';
import React, { useMemo } from 'react';

import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Protect, withProtect } from '../../common';
import { Box, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { useInView } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';
import { EnrollmentBadge } from './EnrollmentBadge';
import { RemoveDomainScreen } from './RemoveDomainScreen';
import { VerifiedDomainScreen } from './VerifiedDomainScreen';
import { VerifyDomainScreen } from './VerifyDomainScreen';

type DomainListProps = GetDomainsParams & {
  verificationStatus?: OrganizationDomainVerificationStatus;
  enrollmentMode?: OrganizationEnrollmentMode;
  fallback?: React.ReactNode;
};

const useMenuActions = (domain: OrganizationDomainResource): PropsOfComponent<typeof ThreeDotsMenu>['actions'] => {
  const { open } = useActionContext();

  const menuActions: PropsOfComponent<typeof ThreeDotsMenu>['actions'] = [];

  if (domain.verification && domain.verification.status === 'verified') {
    menuActions.push({
      label: localizationKeys('organizationProfile.profilePage.domainSection.menuAction__manage'),
      onClick: () => open('manage'),
    });
  } else {
    menuActions.push({
      label: localizationKeys('organizationProfile.profilePage.domainSection.menuAction__verify'),
      onClick: () => open('verify'),
    });
  }

  menuActions.push({
    label: localizationKeys('organizationProfile.profilePage.domainSection.menuAction__remove'),
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

export const DomainList = withProtect(
  (props: DomainListProps) => {
    const { verificationStatus, enrollmentMode, fallback, ...rest } = props;
    const { organization, domains } = useOrganization({
      domains: {
        infinite: true,
        ...rest,
      },
    });

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

    const hasNextOrFetching = domains?.hasNextPage || domains?.isFetching;

    if (domainList.length === 0 && !domains?.isLoading && !fallback) {
      return null;
    }

    return (
      <ProfileSection.ItemList id='organizationDomains'>
        {domainList.length === 0 && !domains?.isLoading && fallback}
        {domainList.map(domain => {
          return (
            <Action.Root key={domain.id}>
              <ProfileSection.Item
                id='organizationDomains'
                hoverable
              >
                <Flex sx={t => ({ gap: t.space.$1 })}>
                  <Text>{domain.name}</Text>
                  <EnrollmentBadge organizationDomain={domain} />
                </Flex>

                <Protect permission='org:sys_domains:manage'>
                  <DomainListMenu domain={domain} />
                </Protect>
              </ProfileSection.Item>

              <Action.Open value='remove'>
                <Action.Card variant='destructive'>
                  <RemoveDomainScreen domainId={domain.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='verify'>
                <Action.Card>
                  <VerifyDomainScreen domainId={domain.id} />
                </Action.Card>
              </Action.Open>

              <Action.Open value='manage'>
                <Action.Card>
                  <VerifiedDomainScreen domainId={domain.id} />
                </Action.Card>
              </Action.Open>
            </Action.Root>
          );
        })}

        <Box
          ref={domains?.hasNextPage && !domains.isFetching ? ref : undefined}
          sx={{ visibility: 'hidden' }}
        />

        {hasNextOrFetching && domains.data.length === 0 && (
          <Box
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
