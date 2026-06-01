import { APIKeys } from './APIKeys';
import { Billing } from './Billing';
import { General } from './General';
import { Members } from './Members';
import { OrganizationProfileProvider } from './OrganizationProfileProvider';
import {
  GeneralDeleteOrganization,
  GeneralLeaveOrganization,
  GeneralOrganizationProfile,
  GeneralVerifiedDomains,
} from './sectionWrappers';
import { ConfigureSSO } from './ConfigureSSO';

export const OrganizationProfile = Object.assign(OrganizationProfileProvider, {
  General,
  Members,
  Billing,
  APIKeys,
  ConfigureSSO,
  GeneralOrganizationProfile,
  GeneralVerifiedDomains,
  GeneralLeaveOrganization,
  GeneralDeleteOrganization,
});
