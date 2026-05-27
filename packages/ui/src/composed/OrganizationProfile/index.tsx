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

export const OrganizationProfile = Object.assign(OrganizationProfileProvider, {
  General,
  Members,
  Billing,
  APIKeys,
  GeneralOrganizationProfile,
  GeneralVerifiedDomains,
  GeneralLeaveOrganization,
  GeneralDeleteOrganization,
});
