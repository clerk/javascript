import { isClerkAPIResponseError } from '@clerk/shared/error';
import { __internal_useOrganizationSSOBypassAllowlist } from '@clerk/shared/react';

import { Alert } from '@/ui/elements/Alert';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';

type SecuritySSOBypassSectionProps = {
  onManage: () => void;
};

const isFeatureNotEnabledError = (error: Error | null): boolean =>
  error !== null && isClerkAPIResponseError(error) && error.errors.some(e => e.code === 'feature_not_enabled');

export const SecuritySSOBypassSection = ({ onManage }: SecuritySSOBypassSectionProps): JSX.Element | null => {
  const { data, isLoading, error } = __internal_useOrganizationSSOBypassAllowlist();

  if (isFeatureNotEnabledError(error)) {
    return null;
  }

  const count = data?.length ?? 0;

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.title')}
      id='ssoBypass'
      centered={false}
    >
      <Col gap={4}>
        <Flex
          align='start'
          justify='between'
          gap={3}
        >
          <Text
            as='p'
            elementDescriptor={descriptors.organizationProfileSecuritySsoBypassDescription}
            colorScheme='secondary'
            localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassSection.description')}
          />

          <ThreeDotsMenu
            elementId='ssoBypass'
            actions={[
              {
                label: localizationKeys('organizationProfile.securityPage.ssoBypassSection.menuAction__manage'),
                onClick: onManage,
              },
            ]}
          />
        </Flex>

        {isLoading ? (
          <Flex align='center'>
            <Spinner
              size='xs'
              colorScheme='neutral'
              elementDescriptor={descriptors.spinner}
            />
          </Flex>
        ) : error ? (
          <Alert
            variant='danger'
            title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.error__load')}
            subtitle={error.message}
          />
        ) : (
          <Flex
            align='center'
            gap={2}
          >
            <Text
              as='span'
              elementDescriptor={descriptors.organizationProfileSecuritySsoBypassCountLabel}
              colorScheme='secondary'
              localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassSection.allowlistLabel')}
            />
            <Badge
              elementDescriptor={descriptors.organizationProfileSecuritySsoBypassCountBadge}
              localizationKey={
                count === 1
                  ? localizationKeys('organizationProfile.securityPage.ssoBypassSection.allowlistCount__one')
                  : localizationKeys('organizationProfile.securityPage.ssoBypassSection.allowlistCount', {
                      count: String(count),
                    })
              }
            />
          </Flex>
        )}
      </Col>
    </ProfileSection.Root>
  );
};
