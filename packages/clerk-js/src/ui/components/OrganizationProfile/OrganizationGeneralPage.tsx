import { useOrganization } from '@clerk/shared/react';

import { Gate, useGate } from '../../common';
import { useEnvironment } from '../../contexts';
import { Button, Col, descriptors, localizationKeys } from '../../customizables';
import { Header, OrganizationPreview, ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { DeleteOrganizationForm, LeaveOrganizationForm } from './ActionConfirmationPage';
import { AddDomainForm } from './AddDomainForm';
import { DomainList } from './DomainList';
import { ProfileForm } from './ProfileForm';

const ProfileScreen = () => {
  const { close } = useActionContext();
  return (
    <ProfileForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const AddDomainScreen = () => {
  const { close } = useActionContext();
  return (
    <AddDomainForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const LeaveOrganizationScreen = () => {
  const { close } = useActionContext();
  return (
    <LeaveOrganizationForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const DeleteOrganizationScreen = () => {
  const { close } = useActionContext();
  return (
    <DeleteOrganizationForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const OrganizationGeneralPage = () => {
  return (
    <Col
      elementDescriptor={descriptors.page}
      sx={t => ({ gap: t.space.$8 })}
    >
      <Col
        elementDescriptor={descriptors.profilePage}
        elementId={descriptors.profilePage.setId('organizationSettings')}
      >
        <Header.Root>
          <Header.Title
            localizationKey={localizationKeys('organizationProfile.general.title')}
            sx={t => ({ marginBottom: t.space.$4 })}
            textVariant='h1'
          />
        </Header.Root>
        <OrganizationProfileSection />
        <Gate permission='org:sys_domains:read'>
          <OrganizationDomainsSection />
        </Gate>
        <OrganizationDangerSection />
      </Col>
    </Col>
  );
};

const OrganizationProfileSection = () => {
  const { organization } = useOrganization();

  if (!organization) {
    return null;
  }

  const profile = <OrganizationPreview organization={organization} />;

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.general.profileSection.title')}
      id='organizationProfile'
    >
      <Action.Root>
        <Gate
          permission={'org:sys_profile:manage'}
          fallback={profile}
        >
          <Action.Closed value='edit'>
            <ProfileSection.Item id='organizationProfile'>
              {profile}

              <Action.Trigger value='edit'>
                <Button
                  id='organizationProfile'
                  variant='ghost'
                  localizationKey={localizationKeys('organizationProfile.general.profileSection.primaryButton')}
                />
              </Action.Trigger>
            </ProfileSection.Item>
          </Action.Closed>
        </Gate>

        <Action.Open value='edit'>
          <Action.Card>
            <ProfileScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const OrganizationDomainsSection = () => {
  const { organizationSettings } = useEnvironment();
  const { organization } = useOrganization();

  if (!organizationSettings || !organization) {
    return null;
  }

  if (!organizationSettings.domains.enabled) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.general.domainSection.title')}
      subtitle={localizationKeys('organizationProfile.general.domainSection.subtitle')}
      id='organizationDomains'
    >
      <Action.Root>
        <DomainList redirectSubPath={'domain'} />

        <Gate permission='org:sys_domains:manage'>
          <Action.Trigger value='add'>
            <ProfileSection.Button
              localizationKey={localizationKeys('organizationProfile.general.domainSection.primaryButton')}
              id='organizationDomains'
            />
          </Action.Trigger>

          <Action.Open value='add'>
            <Action.Card>
              <AddDomainScreen />
            </Action.Card>
          </Action.Open>
        </Gate>
      </Action.Root>
    </ProfileSection.Root>
  );
};

const OrganizationDangerSection = () => {
  const { organization } = useOrganization();
  const { isAuthorizedUser: canDeleteOrganization } = useGate({ permission: 'org:sys_profile:delete' });

  if (!organization) {
    return null;
  }

  const adminDeleteEnabled = organization.adminDeleteEnabled;

  return (
    <ProfileSection.Root
      id='organizationDanger'
      title={localizationKeys('organizationProfile.profilePage.dangerSection.title')}
      sx={t => ({ marginBottom: t.space.$4 })}
    >
      <Action.Root>
        <Action.Closed value={['leave', 'delete']}>
          <ProfileSection.ItemList
            sx={{ flexDirection: 'row' }}
            id='organizationDanger'
          >
            <ProfileSection.Item id='organizationDanger'>
              <Action.Trigger value='leave'>
                <Button
                  variant='ghostDanger'
                  localizationKey={localizationKeys(
                    'organizationProfile.profilePage.dangerSection.leaveOrganization.title',
                  )}
                />
              </Action.Trigger>
            </ProfileSection.Item>

            {canDeleteOrganization && adminDeleteEnabled && (
              <ProfileSection.Item id={'organizationDanger'}>
                <Action.Trigger value='delete'>
                  <Button
                    variant='ghostDanger'
                    localizationKey={localizationKeys(
                      'organizationProfile.profilePage.dangerSection.deleteOrganization.title',
                    )}
                  />
                </Action.Trigger>
              </ProfileSection.Item>
            )}
          </ProfileSection.ItemList>
        </Action.Closed>

        <Action.Open value='leave'>
          <Action.Card variant='destructive'>
            <LeaveOrganizationScreen />
          </Action.Card>
        </Action.Open>

        <Action.Open value='delete'>
          <Action.Card variant='destructive'>
            <DeleteOrganizationScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
