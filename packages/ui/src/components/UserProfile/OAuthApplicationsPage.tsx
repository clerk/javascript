import { useClerk, useUser } from '@clerk/shared/react';
import type { OAuthApplicationInfo } from '@clerk/shared/types';

import { Col, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Avatar } from '@/ui/elements/Avatar';
import { FullHeightLoader } from '@/ui/elements/FullHeightLoader';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { ProfileSection } from '@/ui/elements/Section';
import { useFetch } from '@/ui/hooks';

export const OAuthApplicationsPage = () => {
  const clerk = useClerk();
  const { user } = useUser();
  const { data, error, isLoading } = useFetch(
    user ? () => clerk.oauthApplication.getApplications() : undefined,
    { userId: user?.id },
    undefined,
    'oauth-applications',
  );

  return (
    <ProfileCard.Page>
      <ProfileCard.PagePanel
        pageId='oauthApplications'
        titleKey={localizationKeys('userProfile.oauthApplicationsPage.title')}
        alertContent={error?.message}
      >
        {!error ? (
          <ProfileSection.Root
            title={localizationKeys('userProfile.oauthApplicationsPage.authorizedApplications.title')}
            centered={false}
            id='oauthApplications'
          >
            <ProfileSection.ItemList
              id='oauthApplications'
              disableAnimation
            >
              {isLoading ? (
                <FullHeightLoader />
              ) : data?.length ? (
                data.map(application => (
                  <OAuthApplicationItem
                    key={application.id}
                    application={application}
                  />
                ))
              ) : (
                <Text
                  colorScheme='secondary'
                  localizationKey={localizationKeys('userProfile.oauthApplicationsPage.authorizedApplications.empty')}
                  sx={t => ({ padding: `${t.space.$2} ${t.space.$2x5}` })}
                />
              )}
            </ProfileSection.ItemList>
          </ProfileSection.Root>
        ) : null}
      </ProfileCard.PagePanel>
    </ProfileCard.Page>
  );
};

const OAuthApplicationItem = ({ application }: { application: OAuthApplicationInfo }) => {
  return (
    <ProfileSection.Item id='oauthApplications'>
      <Flex
        align='center'
        gap={3}
        sx={{ minWidth: 0 }}
      >
        <Avatar
          title={application.name}
          initials={application.name.slice(0, 2).toUpperCase()}
          imageUrl={application.clientImageUrl}
          rounded={false}
        />
        <Col sx={{ minWidth: 0 }}>
          <Text truncate>{application.name}</Text>
          {application.clientUri ? (
            <Text
              truncate
              colorScheme='secondary'
            >
              {displayClientURI(application.clientUri)}
            </Text>
          ) : null}
        </Col>
      </Flex>
    </ProfileSection.Item>
  );
};

const displayClientURI = (clientUri: string) => {
  try {
    return new URL(clientUri).hostname;
  } catch {
    return clientUri;
  }
};
