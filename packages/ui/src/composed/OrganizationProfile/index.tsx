import { APIKeys } from './APIKeys';
import { Billing } from './Billing';
import { General } from './General';
import { Members } from './Members';
import { OrganizationProfileProvider } from './OrganizationProfileProvider';

export const OrganizationProfile = {
  Provider: OrganizationProfileProvider,
  General,
  Members,
  Billing,
  APIKeys,
};
