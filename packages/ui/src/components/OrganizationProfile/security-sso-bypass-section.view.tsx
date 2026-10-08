import { Alert } from '@/ui/elements/Alert';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';

import { Badge, Col, descriptors, Flex, localizationKeys, Spinner, Text } from '../../customizables';
import type { useSecuritySSOBypassSectionModel } from './security-sso-bypass-section.model';

export const SecuritySSOBypassSectionView = ({
  status,
  count,
  errorMessage,
  onManage,
}: ReturnType<typeof useSecuritySSOBypassSectionModel> & { onManage: () => void }): JSX.Element | null => {
  if (status === 'hidden') {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.title')}
      id='ssoBypass'
      centered={false}
    >
      <Col gap={4}>
        <Flex
          align='center'
          justify='between'
          gap={3}
        >
          {status === 'loading' ? (
            <Spinner
              size='xs'
              colorScheme='neutral'
              elementDescriptor={descriptors.spinner}
            />
          ) : status === 'error' ? (
            <Alert
              variant='danger'
              title={localizationKeys('organizationProfile.securityPage.ssoBypassSection.error__load')}
              subtitle={errorMessage}
            />
          ) : (
            <Flex
              align='center'
              gap={2}
            >
              <Text
                as='span'
                elementDescriptor={descriptors.organizationProfileSecuritySsoBypassCountLabel}
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

        <Text
          as='p'
          elementDescriptor={descriptors.organizationProfileSecuritySsoBypassDescription}
          colorScheme='secondary'
          localizationKey={localizationKeys('organizationProfile.securityPage.ssoBypassSection.description')}
        />
      </Col>
    </ProfileSection.Root>
  );
};
