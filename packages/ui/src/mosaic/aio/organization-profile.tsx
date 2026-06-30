import { OrganizationProfileGeneral } from '../panels/organization-profile-general';
import { OrganizationProfileView } from './organization-profile-view';

export function OrganizationProfile() {
  return <OrganizationProfileView general={<OrganizationProfileGeneral />} />;
}
