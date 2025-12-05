import type { CustomPage, EnvironmentResource, LoadedClerk } from '@clerk/shared/types';

import {
  disabledOrganizationAPIKeysFeature,
  disabledOrganizationBillingFeature,
  disabledUserAPIKeysFeature,
  disabledUserBillingFeature,
  isValidUrl,
} from '../../utils';
import { ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID, USER_PROFILE_NAVBAR_ROUTE_ID } from '../constants';
import type { NavbarRoute } from '../elements/Navbar';
import { Code, CreditCard, Organization, TickShield, User, Users } from '../icons';
import { localizationKeys } from '../localization';
import { ExternalElementMounter } from './ExternalElementMounter';
import { isDevelopmentSDK } from './runtimeEnvironment';
import { sanitizeCustomLinkURL } from './sanitizeCustomLinkURL';

export type CustomPageContent = {
  url: string;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type ProfileReorderItem = {
  label: 'account' | 'security' | 'members' | 'general' | 'billing' | 'apiKeys';
};

type ProfileCustomPage = {
  label: string;
  url: string;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type ProfileCustomLink = {
  label: string;
  url: string;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
};

type GetDefaultRoutesReturnType = {
  INITIAL_ROUTES: NavbarRoute[];
  pageToRootNavbarRouteMap: Record<string, NavbarRoute>;
  validReorderItemLabels: string[];
};

type CreateCustomPagesParams = {
  customPages: CustomPage[];
  getDefaultRoutes: ({ commerce, apiKeys }: { commerce: boolean; apiKeys: boolean }) => GetDefaultRoutesReturnType;
  setFirstPathToRoot: (routes: NavbarRoute[]) => NavbarRoute[];
  excludedPathsFromDuplicateWarning: string[];
};

export const createUserProfileCustomPages = (
  customPages: CustomPage[],
  clerk: LoadedClerk,
  shouldShowBilling: boolean,
  environment?: EnvironmentResource,
) => {
  return createCustomPages(
    {
      customPages,
      getDefaultRoutes: getUserProfileDefaultRoutes,
      setFirstPathToRoot: setFirstPathToUserProfileRoot,
      excludedPathsFromDuplicateWarning: [],
    },
    clerk,
    shouldShowBilling,
    environment,
  );
};

export const createOrganizationProfileCustomPages = (
  customPages: CustomPage[],
  clerk: LoadedClerk,
  shouldShowBilling: boolean,
  environment?: EnvironmentResource,
) => {
  return createCustomPages(
    {
      customPages,
      getDefaultRoutes: getOrganizationProfileDefaultRoutes,
      setFirstPathToRoot: setFirstPathToOrganizationProfileRoot,
      excludedPathsFromDuplicateWarning: [],
    },
    clerk,
    shouldShowBilling,
    environment,
    true,
  );
};

const createCustomPages = (
  { customPages, getDefaultRoutes, setFirstPathToRoot, excludedPathsFromDuplicateWarning }: CreateCustomPagesParams,
  clerk: LoadedClerk,
  shouldShowBilling: boolean,
  environment?: EnvironmentResource,
  organization?: boolean,
) => {
  const { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels } = getDefaultRoutes({
    commerce: organization
      ? !disabledOrganizationBillingFeature(clerk, environment) && shouldShowBilling
      : !disabledUserBillingFeature(clerk, environment) && shouldShowBilling,
    apiKeys: organization
      ? !disabledOrganizationAPIKeysFeature(clerk, environment)
      : !disabledUserAPIKeysFeature(clerk, environment),
  });

  if (isDevelopmentSDK(clerk)) {
    checkForDuplicateUsageOfReorderingItems(customPages, validReorderItemLabels);
  }

  const validCustomPages = customPages.filter(cp => {
    if (!isValidPageItem(cp, validReorderItemLabels)) {
      if (isDevelopmentSDK(clerk)) {
        console.error('Clerk: Invalid custom page data: ', cp);
      }
      return false;
    }
    return true;
  });

  const { allRoutes, contents } = getRoutesAndContents({
    customPages: validCustomPages,
    defaultRoutes: INITIAL_ROUTES,
  });

  assertExternalLinkAsRoot(allRoutes);

  const routes = setFirstPathToRoot(allRoutes);

  if (isDevelopmentSDK(clerk)) {
    warnForDuplicatePaths(routes, excludedPathsFromDuplicateWarning);
  }

  return {
    routes,
    contents,
    pageToRootNavbarRouteMap,
  };
};

type GetRoutesAndContentsParams = {
  customPages: CustomPage[];
  defaultRoutes: NavbarRoute[];
};

const getRoutesAndContents = ({ customPages, defaultRoutes }: GetRoutesAndContentsParams) => {
  let remainingDefaultRoutes: NavbarRoute[] = defaultRoutes.map(r => r);
  const contents: CustomPageContent[] = [];

  const routesWithoutDefaults: NavbarRoute[] = customPages.map((cp, index) => {
    if (isCustomLink(cp)) {
      return {
        name: cp.label,
        id: `custom-page-${index}`,
        icon: props => (
          <ExternalElementMounter
            mount={cp.mountIcon}
            unmount={cp.unmountIcon}
            {...props}
          />
        ),
        path: sanitizeCustomLinkURL(cp.url),
        external: true,
      };
    }
    if (isCustomPage(cp)) {
      const pageURL = sanitizeCustomPageURL(cp.url);
      contents.push({ url: pageURL, mount: cp.mount, unmount: cp.unmount });
      return {
        name: cp.label,
        id: `custom-page-${index}`,
        icon: props => (
          <ExternalElementMounter
            mount={cp.mountIcon}
            unmount={cp.unmountIcon}
            {...props}
          />
        ),
        path: pageURL,
      };
    }
    const reorderItem = defaultRoutes.find(r => r.id === cp.label) as NavbarRoute;
    remainingDefaultRoutes = remainingDefaultRoutes.filter(({ id }) => id !== cp.label);
    return { ...reorderItem };
  });

  const allRoutes = [...remainingDefaultRoutes, ...routesWithoutDefaults];

  return { allRoutes, contents };
};

const setFirstPathToUserProfileRoot = (routes: NavbarRoute[]): NavbarRoute[] => {
  return routes.map((r, index) => (index === 0 ? { ...r, path: '/' } : r));
};

const setFirstPathToOrganizationProfileRoot = (routes: NavbarRoute[]): NavbarRoute[] => {
  return routes.map((r, index) => (index === 0 ? { ...r, path: '/' } : r));
};

const checkForDuplicateUsageOfReorderingItems = (customPages: CustomPage[], validReorderItems: string[]) => {
  const reorderItems = customPages.filter(cp => isReorderItem(cp, validReorderItems));
  reorderItems.reduce((acc, cp) => {
    if (acc.includes(cp.label)) {
      console.error(
        `Clerk: The "${cp.label}" item is used more than once when reordering pages. This may cause unexpected behavior.`,
      );
    }
    return [...acc, cp.label];
  }, [] as string[]);
};

//path !== '/' && path !== 'account'
const warnForDuplicatePaths = (routes: NavbarRoute[], pathsToFilter: string[]) => {
  const paths = routes
    .filter(({ external, path }) => !external && pathsToFilter.every(p => p !== path))
    .map(({ path }) => path);
  const duplicatePaths = paths.filter((p, index) => paths.indexOf(p) !== index);
  duplicatePaths.forEach(p => {
    console.error(`Clerk: Duplicate path "${p}" found in custom pages. This may cause unexpected behavior.`);
  });
};

const isValidPageItem = (cp: CustomPage, validReorderItems: string[]): cp is CustomPage => {
  return isCustomPage(cp) || isCustomLink(cp) || isReorderItem(cp, validReorderItems);
};

const isCustomPage = (cp: CustomPage): cp is ProfileCustomPage => {
  return !!cp.url && !!cp.label && !!cp.mount && !!cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isCustomLink = (cp: CustomPage): cp is ProfileCustomLink => {
  return !!cp.url && !!cp.label && !cp.mount && !cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isReorderItem = (cp: CustomPage, validItems: string[]): cp is ProfileReorderItem => {
  return (
    !cp.url && !cp.mount && !cp.unmount && !cp.mountIcon && !cp.unmountIcon && validItems.some(v => v === cp.label)
  );
};

const sanitizeCustomPageURL = (url: string): string => {
  if (!url) {
    throw new Error('Clerk: URL is required for custom pages');
  }
  if (isValidUrl(url)) {
    throw new Error('Clerk: Absolute URLs are not supported for custom pages');
  }
  return (url as string).charAt(0) === '/' && (url as string).length > 1 ? (url as string).substring(1) : url;
};

const assertExternalLinkAsRoot = (routes: NavbarRoute[]) => {
  if (routes[0].external) {
    throw new Error('Clerk: The first route cannot be a custom external link component');
  }
};

const getUserProfileDefaultRoutes = ({
  commerce,
  apiKeys,
}: {
  commerce: boolean;
  apiKeys: boolean;
}): GetDefaultRoutesReturnType => {
  const INITIAL_ROUTES: NavbarRoute[] = [
    {
      name: localizationKeys('userProfile.navbar.account'),
      id: USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT,
      icon: User,
      path: 'account',
    },
    {
      name: localizationKeys('userProfile.navbar.security'),
      id: USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY,
      icon: TickShield,
      path: 'security',
    },
  ];
  if (commerce) {
    INITIAL_ROUTES.push({
      name: localizationKeys('userProfile.navbar.billing'),
      id: USER_PROFILE_NAVBAR_ROUTE_ID.BILLING,
      icon: CreditCard,
      path: 'billing',
    });
  }
  if (apiKeys) {
    INITIAL_ROUTES.push({
      name: localizationKeys('userProfile.navbar.apiKeys'),
      id: USER_PROFILE_NAVBAR_ROUTE_ID.API_KEYS,
      icon: Code,
      path: 'api-keys',
    });
  }

  const pageToRootNavbarRouteMap: Record<string, NavbarRoute> = {
    profile: INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    'email-address': INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    'phone-number': INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    'connected-account': INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    'web3-wallet': INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    username: INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.ACCOUNT) as NavbarRoute,
    'multi-factor': INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY) as NavbarRoute,
    password: INITIAL_ROUTES.find(r => r.id === USER_PROFILE_NAVBAR_ROUTE_ID.SECURITY) as NavbarRoute,
  };

  const validReorderItemLabels: string[] = INITIAL_ROUTES.map(r => r.id);

  return { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels };
};

const getOrganizationProfileDefaultRoutes = ({
  commerce,
  apiKeys,
}: {
  commerce: boolean;
  apiKeys: boolean;
}): GetDefaultRoutesReturnType => {
  const INITIAL_ROUTES: NavbarRoute[] = [
    {
      name: localizationKeys('organizationProfile.navbar.general'),
      id: ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL,
      icon: Organization,
      path: 'organization-general',
    },
    {
      name: localizationKeys('organizationProfile.navbar.members'),
      id: ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS,
      icon: Users,
      path: 'organization-members',
    },
  ];
  if (commerce) {
    INITIAL_ROUTES.push({
      name: localizationKeys('organizationProfile.navbar.billing'),
      id: USER_PROFILE_NAVBAR_ROUTE_ID.BILLING,
      icon: CreditCard,
      path: 'organization-billing',
    });
  }
  if (apiKeys) {
    INITIAL_ROUTES.push({
      name: localizationKeys('organizationProfile.navbar.apiKeys'),
      id: ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.API_KEYS,
      icon: Code,
      path: 'organization-api-keys',
    });
  }

  const pageToRootNavbarRouteMap: Record<string, NavbarRoute> = {
    'invite-members': INITIAL_ROUTES.find(r => r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.MEMBERS) as NavbarRoute,
    domain: INITIAL_ROUTES.find(r => r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL) as NavbarRoute,
    profile: INITIAL_ROUTES.find(r => r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL) as NavbarRoute,
    leave: INITIAL_ROUTES.find(r => r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL) as NavbarRoute,
    delete: INITIAL_ROUTES.find(r => r.id === ORGANIZATION_PROFILE_NAVBAR_ROUTE_ID.GENERAL) as NavbarRoute,
  };

  const validReorderItemLabels: string[] = INITIAL_ROUTES.map(r => r.id);

  return { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels };
};
