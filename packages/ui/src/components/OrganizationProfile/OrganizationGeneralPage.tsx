import { DeleteOrganizationForm, LeaveOrganizationForm } from './ActionConfirmationPage';
import { AddDomainForm } from './AddDomainForm';
import { DomainList } from './DomainList';
import { useOrganizationGeneralScreenController } from './organization-general.controller';
import {
  useOrganizationDeleteSectionModel,
  useOrganizationDomainsSectionModel,
  useOrganizationGeneralPageModel,
  useOrganizationLeaveSectionModel,
  useOrganizationProfileSectionModel,
} from './organization-general.model';
import {
  OrganizationDeleteSectionView,
  OrganizationDomainsSectionView,
  OrganizationGeneralPageView,
  OrganizationLeaveSectionView,
  OrganizationProfileSectionView,
} from './organization-general.view';
import { ProfileForm } from './ProfileForm';

const ProfileScreen = () => {
  const { close } = useOrganizationGeneralScreenController();
  return (
    <ProfileForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const AddDomainScreen = () => {
  const { close } = useOrganizationGeneralScreenController();
  return (
    <AddDomainForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const LeaveOrganizationScreen = () => {
  const { close } = useOrganizationGeneralScreenController();
  return (
    <LeaveOrganizationForm
      onSuccess={close}
      onReset={close}
    />
  );
};

const DeleteOrganizationScreen = () => {
  const { close } = useOrganizationGeneralScreenController();
  return (
    <DeleteOrganizationForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const OrganizationGeneralPage = () => {
  const model = useOrganizationGeneralPageModel();

  return (
    <OrganizationGeneralPageView
      profile={<OrganizationProfileSection />}
      domains={model.canReadDomains ? <OrganizationDomainsSection /> : null}
      leave={<OrganizationLeaveSection />}
      deleteSection={<OrganizationDeleteSection />}
    />
  );
};

/**
 * Renders the organization profile section (name, logo) with inline edit when the user has
 * `org:sys_profile:manage`.
 *
 * @returns The profile section, or `null` when no organization is active.
 */
export const OrganizationProfileSection = (): JSX.Element | null => {
  const model = useOrganizationProfileSectionModel();
  if (!model.available) {
    return null;
  }

  return (
    <OrganizationProfileSectionView
      model={model}
      profileScreen={<ProfileScreen />}
    />
  );
};

/**
 * Renders the verified-domains section.
 *
 * @returns The domains section, or `null` when domains are disabled, no organization is active, or
 * there are no domains and the user cannot add any.
 */
export const OrganizationDomainsSection = (): JSX.Element | null => {
  const model = useOrganizationDomainsSectionModel();
  if (!model.visible) {
    return null;
  }

  return (
    <OrganizationDomainsSectionView
      domainList={<DomainList />}
      canManageDomains={model.canManageDomains}
      addDomainScreen={<AddDomainScreen />}
    />
  );
};

/**
 * Renders the "leave organization" action in the danger section.
 *
 * @returns The leave-organization section, or `null` when no organization is active.
 */
export const OrganizationLeaveSection = (): JSX.Element | null => {
  const model = useOrganizationLeaveSectionModel();
  return model.visible ? <OrganizationLeaveSectionView leaveScreen={<LeaveOrganizationScreen />} /> : null;
};

/**
 * Renders the "delete organization" action in the danger section.
 *
 * @returns The delete-organization section, or `null` when no organization is active, the user
 * lacks `org:sys_profile:delete`, or admin delete is disabled.
 */
export const OrganizationDeleteSection = (): JSX.Element | null => {
  const model = useOrganizationDeleteSectionModel();
  return model.visible ? <OrganizationDeleteSectionView deleteScreen={<DeleteOrganizationScreen />} /> : null;
};
