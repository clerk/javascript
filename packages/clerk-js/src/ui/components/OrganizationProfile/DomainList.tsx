import type { GetDomainsParams, OrganizationDomainResource, OrganizationEnrollmentMode } from '@clerk/types';
import type { OrganizationDomainVerificationStatus } from '@clerk/types';
import React, { useMemo } from 'react';

import { stripOrigin, toURL, trimLeadingSlash } from '../../../utils';
import { useGate, withGate } from '../../common';
import { useCoreOrganization, useOrganizationProfileContext } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Box, Col, localizationKeys, Spinner } from '../../customizables';
import { ArrowBlockButton, BlockWithTrailingComponent, ThreeDotsMenu } from '../../elements';
import { useInView } from '../../hooks';
import { useRouter } from '../../router';
import { EnrollmentBadge } from './EnrollmentBadge';

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

const buildDomainListRelativeURL = (parentPath: string, domainId: string, mode?: 'verify' | 'remove') =>
  trimLeadingSlash(stripOrigin(toURL(`${parentPath}/${domainId}/${mode || ''}`)));

const useMenuActions = (
  parentPath: string,
  domainId: string,
): { label: LocalizationKey; onClick: () => Promise<unknown>; isDestructive?: boolean }[] => {
  const { isAuthorizedUser: canManageDomain } = useGate({ permission: 'org:sys_domains:manage' });

  const { navigate } = useRouter();

  const menuActions = [];

  if (canManageDomain) {
    menuActions.push({
      label: localizationKeys('organizationProfile.profilePage.domainSection.unverifiedDomain_menuAction__verify'),
      onClick: () => navigate(buildDomainListRelativeURL(parentPath, domainId, 'verify')),
    });
    menuActions.push({
      label: localizationKeys('organizationProfile.profilePage.domainSection.unverifiedDomain_menuAction__remove'),
      isDestructive: true,
      onClick: () => navigate(buildDomainListRelativeURL(parentPath, domainId, 'remove')),
    });
  }

  return menuActions;
};

const DomainListDotMenu = ({
  redirectSubPath,
  domainId,
}: Pick<DomainListProps, 'redirectSubPath'> & {
  domainId: OrganizationDomainResource['id'];
}) => {
  const actions = useMenuActions(redirectSubPath, domainId);
  return <ThreeDotsMenu actions={actions} />;
};

export const DomainList = withGate(
  (props: DomainListProps) => {
    const { verificationStatus, enrollmentMode, redirectSubPath, fallback, ...rest } = props;
    const { organization, domains } = useCoreOrganization({
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
    const { navigate } = useRouter();
    const { pathToDomainPage } = useOrganizationProfileContext();

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

    // TODO: Split this to smaller components
    return (
      <Col>
        {domainList.length === 0 && !domains?.isLoading && fallback}
        {domainList.map(d => {
          if (!(d.verification && d.verification.status === 'verified') || !canManageDomain) {
            return (
              <BlockWithTrailingComponent
                key={d.id}
                sx={t => ({
                  '&:hover': {
                    backgroundColor: t.colors.$blackAlpha50,
                  },
                  padding: `${t.space.$none} ${t.space.$4}`,
                  minHeight: t.sizes.$10,
                })}
                badge={<EnrollmentBadge organizationDomain={d} />}
                trailingComponent={
                  canManageDomain ? (
                    <DomainListDotMenu
                      redirectSubPath={redirectSubPath}
                      domainId={d.id}
                    />
                  ) : undefined
                }
              >
                {d.name}
              </BlockWithTrailingComponent>
            );
          }

          return (
            <ArrowBlockButton
              key={d.id}
              variant='ghost'
              colorScheme='neutral'
              badge={!verificationStatus ? <EnrollmentBadge organizationDomain={d} /> : undefined}
              sx={t => ({
                padding: `${t.space.$3} ${t.space.$4}`,
                minHeight: t.sizes.$10,
              })}
              onClick={() => {
                if (redirectSubPath === 'domain') {
                  return navigate(trimLeadingSlash(stripOrigin(toURL(`domain/${d.id}`))));
                }
                return navigate(trimLeadingSlash(`${pathToDomainPage}/${d.id}`));
              }}
            >
              {d.name}
            </ArrowBlockButton>
          );
        })}
        {(domains?.hasNextPage || domains?.isFetching) && (
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
              />
            </Box>
          </Box>
        )}
      </Col>
    );
  },
  {
    permission: 'org:sys_domains:read',
  },
);
