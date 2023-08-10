import type { GetDomainsParams, OrganizationEnrollmentMode } from '@clerk/types';
import type { OrganizationDomainVerificationStatus } from '@clerk/types';
import React, { useMemo } from 'react';

import { useCoreOrganization } from '../../contexts';
import { Badge, Box, Col, descriptors, Spinner } from '../../customizables';
import { ArrowBlockButton } from '../../elements';
import { useInView } from '../../hooks';
import { useRouter } from '../../router';

type DomainListProps = GetDomainsParams & {
  verificationStatus?: OrganizationDomainVerificationStatus;
  enrollmentMode?: OrganizationEnrollmentMode;
  /**
   * Enables internal links to navigate to the correct page
   * based on when this component is used
   */
  redirectSubPath: string;
  fallback?: React.ReactNode;
};

export const DomainList = (props: DomainListProps) => {
  const { verificationStatus, enrollmentMode, redirectSubPath, fallback, ...rest } = props;
  const { organization, membership, domains } = useCoreOrganization({
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
  const { navigate } = useRouter();

  const isAdmin = membership?.role === 'admin';

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

  if (!organization || !isAdmin) {
    return null;
  }

  // TODO: Split this to smaller components
  return (
    <Col>
      {domainList.length === 0 && !domains?.isLoading && fallback}
      {domainList.map(d => (
        <ArrowBlockButton
          key={d.id}
          elementDescriptor={descriptors.accordionTriggerButton}
          variant='ghost'
          colorScheme='neutral'
          badge={
            !verificationStatus ? (
              d.verification && d.verification.status === 'verified' ? (
                <Badge textVariant={'extraSmallRegular'}>Verified</Badge>
              ) : (
                <Badge
                  textVariant={'extraSmallRegular'}
                  colorScheme={'warning'}
                >
                  Unverified
                </Badge>
              )
            ) : undefined
          }
          sx={t => ({
            padding: `${t.space.$3} ${t.space.$4}`,
            minHeight: t.sizes.$10,
          })}
          onClick={() => {
            d.verification && d.verification.status === 'verified'
              ? void navigate(`${redirectSubPath}${d.id}`)
              : void navigate(`${redirectSubPath}${d.id}/verify`);
          }}
        >
          {d.name}
        </ArrowBlockButton>
      ))}
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
              size='md'
              colorScheme='primary'
            />
          </Box>
        </Box>
      )}
    </Col>
  );
};
