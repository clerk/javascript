import type { ReactNode } from 'react';

import { Col, localizationKeys, Text } from '@/customizables';
import { Action } from '@/ui/elements/Action';
import { OrganizationPreview } from '@/ui/elements/OrganizationPreview';
import { ProfileCard } from '@/ui/elements/ProfileCard';
import { ProfileSection } from '@/ui/elements/Section';

import type { useOrganizationProfileSectionModel } from './organization-general.model';

export const OrganizationGeneralPageView = ({
  profile,
  domains,
  leave,
  deleteSection,
}: {
  profile: ReactNode;
  domains: ReactNode;
  leave: ReactNode;
  deleteSection: ReactNode;
}) => (
  <ProfileCard.Page>
    <ProfileCard.PagePanel
      pageId='organizationGeneral'
      titleKey={localizationKeys('organizationProfile.start.headerTitle__general')}
    >
      {profile}
      {domains}
      {leave}
      {deleteSection}
    </ProfileCard.PagePanel>
  </ProfileCard.Page>
);

export const OrganizationProfileSectionView = ({
  model,
  profileScreen,
}: {
  model: ReturnType<typeof useOrganizationProfileSectionModel>;
  profileScreen: ReactNode;
}) => {
  if (!model.organization) {
    return null;
  }

  const profile = (
    <OrganizationPreview
      size='lg'
      mainIdentifierVariant='subtitle'
      organization={model.organization}
    />
  );

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.start.profileSection.title')}
      id='organizationProfile'
    >
      <Action.Root>
        {model.canManageProfile ? (
          <Action.Closed value='edit'>
            <ProfileSection.Item id='organizationProfile'>
              {profile}

              <Action.Trigger value='edit'>
                <ProfileSection.Button
                  id='organizationProfile'
                  localizationKey={localizationKeys('organizationProfile.start.profileSection.primaryButton')}
                />
              </Action.Trigger>
            </ProfileSection.Item>
          </Action.Closed>
        ) : (
          profile
        )}

        <Action.Open value='edit'>
          <Action.Card>{profileScreen}</Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

export const OrganizationDomainsSectionView = ({
  domainList,
  canManageDomains,
  addDomainScreen,
}: {
  domainList: ReactNode;
  canManageDomains: boolean;
  addDomainScreen: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.profilePage.domainSection.title')}
    id='organizationDomains'
    centered={false}
  >
    <Action.Root>
      {domainList}

      {canManageDomains && (
        <>
          <Action.Trigger value='add'>
            <Col>
              <ProfileSection.ArrowButton
                localizationKey={localizationKeys('organizationProfile.profilePage.domainSection.primaryButton')}
                id='organizationDomains'
              />
              <Text
                localizationKey={localizationKeys('organizationProfile.profilePage.domainSection.subtitle')}
                sx={t => ({ paddingInlineStart: t.space.$8x5 })}
                colorScheme='secondary'
              />
            </Col>
          </Action.Trigger>

          <Action.Open value='add'>
            <Action.Card>{addDomainScreen}</Action.Card>
          </Action.Open>
        </>
      )}
    </Action.Root>
  </ProfileSection.Root>
);

export const OrganizationLeaveSectionView = ({ leaveScreen }: { leaveScreen: ReactNode }) => (
  <ProfileSection.Root
    id='organizationDanger'
    title={localizationKeys('organizationProfile.profilePage.dangerSection.leaveOrganization.title')}
  >
    <Action.Root>
      <Action.Closed value='leave'>
        <ProfileSection.Item
          sx={t => ({
            paddingTop: 0,
            paddingBottom: 0,
            paddingInlineStart: t.space.$1,
          })}
          id='organizationDanger'
        >
          <Action.Trigger value='leave'>
            <ProfileSection.Button
              id='organizationDanger'
              variant='ghost'
              colorScheme='danger'
              textVariant='buttonLarge'
              localizationKey={localizationKeys(
                'organizationProfile.profilePage.dangerSection.leaveOrganization.title',
              )}
            />
          </Action.Trigger>
        </ProfileSection.Item>
      </Action.Closed>

      <Action.Open value='leave'>
        <Action.Card variant='destructive'>{leaveScreen}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);

export const OrganizationDeleteSectionView = ({ deleteScreen }: { deleteScreen: ReactNode }) => (
  <ProfileSection.Root
    id='organizationDanger'
    title={localizationKeys('organizationProfile.profilePage.dangerSection.deleteOrganization.title')}
    sx={t => ({ marginBottom: t.space.$4 })}
  >
    <Action.Root>
      <Action.Closed value='delete'>
        <ProfileSection.Item
          sx={t => ({
            paddingTop: 0,
            paddingBottom: 0,
            paddingInlineStart: t.space.$1,
          })}
          id={'organizationDanger'}
        >
          <Action.Trigger value='delete'>
            <ProfileSection.Button
              id='organizationDanger'
              variant='ghost'
              colorScheme='danger'
              textVariant='buttonLarge'
              localizationKey={localizationKeys(
                'organizationProfile.profilePage.dangerSection.deleteOrganization.title',
              )}
            />
          </Action.Trigger>
        </ProfileSection.Item>
      </Action.Closed>

      <Action.Open value='delete'>
        <Action.Card variant='destructive'>{deleteScreen}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);
