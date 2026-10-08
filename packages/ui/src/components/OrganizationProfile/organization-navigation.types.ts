import type { NavbarRoute } from '../../elements/Navbar';
import type { CustomPageContent } from '../../utils/createCustomPages';

export type OrganizationProfileRoutesData = {
  customPages: CustomPageContent[];
  isMembersPageRoot: boolean;
  isGeneralPageRoot: boolean;
  isBillingPageRoot: boolean;
  isAPIKeysPageRoot: boolean;
  isSecurityPageRoot: boolean;
  showBilling: boolean;
  hasPaidPlans: boolean;
  showAPIKeys: boolean;
  showSecurity: boolean;
};

export type OrganizationProfileNavbarData = { routes: NavbarRoute[] };
export type OrganizationProfileNavbarModel = OrganizationProfileNavbarData & { hasOrganization: boolean };
