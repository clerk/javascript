import { isDevelopmentEnvironment } from '@clerk/shared';
import type { CustomPage } from '@clerk/types';

import { isValidUrl } from '../../utils';
import type { NavbarRoute } from '../elements';
import { CogFilled, TickShield, User } from '../icons';
import { localizationKeys } from '../localization';
import { ExternalElementMounter } from './ExternalElementMounter';

export type CustomPageContent = {
  url: string;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type UserProfileReorderItem = {
  label: 'account' | 'security';
};

type UserProfileCustomPage = {
  label: string;
  url: string;
  mountIcon: (el: HTMLDivElement) => void;
  unmountIcon: (el?: HTMLDivElement) => void;
  mount: (el: HTMLDivElement) => void;
  unmount: (el?: HTMLDivElement) => void;
};

type UserProfileCustomLink = {
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
  getDefaultRoutes: () => GetDefaultRoutesReturnType;
  setFirstPathToRoot: (routes: NavbarRoute[]) => NavbarRoute[];
  excludedPathsFromDuplicateWarning: string[];
};

export const createUserProfileCustomPages = (customPages: CustomPage[]) => {
  return createCustomPages({
    customPages,
    getDefaultRoutes: getUserProfileDefaultRoutes,
    setFirstPathToRoot: setFirstPathToUserProfileRoot,
    excludedPathsFromDuplicateWarning: ['/', 'account'],
  });
};

export const createOrganizationProfileCustomPages = (customPages: CustomPage[]) => {
  return createCustomPages({
    customPages,
    getDefaultRoutes: getOrganizationProfileDefaultRoutes,
    setFirstPathToRoot: setFirstPathToOrganizationProfileRoot,
    excludedPathsFromDuplicateWarning: [],
  });
};

const createCustomPages = ({
  customPages,
  getDefaultRoutes,
  setFirstPathToRoot,
  excludedPathsFromDuplicateWarning,
}: CreateCustomPagesParams) => {
  const { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels } = getDefaultRoutes();

  if (isDevelopmentEnvironment()) {
    checkForDuplicateUsageOfReorderingItems(customPages, validReorderItemLabels);
  }

  const validCustomPages = customPages.filter(cp => {
    if (!isValidPageItem(cp, validReorderItemLabels)) {
      if (isDevelopmentEnvironment()) {
        console.error('Invalid custom page data: ', cp);
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

  if (isDevelopmentEnvironment()) {
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
  let remainingDefaultRoutes: NavbarRoute[] = defaultRoutes.map(r => ({ ...r }));
  const contents: CustomPageContent[] = [];

  const routesWithoutDefaults: NavbarRoute[] = customPages.map((cp, index) => {
    if (isCustomLink(cp)) {
      return {
        name: cp.label,
        id: `custom-page-${index}`,
        icon: () => (
          <ExternalElementMounter
            mount={cp.mountIcon}
            unmount={cp.unmountIcon}
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
        icon: () => (
          <ExternalElementMounter
            mount={cp.mountIcon}
            unmount={cp.unmountIcon}
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

// Set the path of the first route to '/' or if the first route is account or security, set the path of both account and security to '/'
const setFirstPathToUserProfileRoot = (routes: NavbarRoute[]): NavbarRoute[] => {
  if (routes[0].id === 'account' || routes[0].id === 'security') {
    return routes.map(r => {
      if (r.id === 'account' || r.id === 'security') {
        return { ...r, path: '/' };
      }
      return r;
    });
  } else {
    return routes.map((r, index) => (index === 0 ? { ...r, path: '/' } : r));
  }
};

const setFirstPathToOrganizationProfileRoot = (routes: NavbarRoute[]): NavbarRoute[] => {
  return routes.map((r, index) => (index === 0 ? { ...r, path: '/' } : r));
};

const checkForDuplicateUsageOfReorderingItems = (customPages: CustomPage[], validReorderItems: string[]) => {
  const reorderItems = customPages.filter(cp => isReorderItem(cp, validReorderItems));
  reorderItems.reduce((acc, cp) => {
    if (acc.includes(cp.label)) {
      console.error(
        `The "${cp.label}" item is used more than once when reordering UserProfile pages. This may cause unexpected behavior.`,
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
    console.error(`Duplicate path "${p}" found in custom pages. This may cause unexpected behavior.`);
  });
};

const isValidPageItem = (cp: CustomPage, validReorderItems: string[]): cp is CustomPage => {
  return isCustomPage(cp) || isCustomLink(cp) || isReorderItem(cp, validReorderItems);
};

const isCustomPage = (cp: CustomPage): cp is UserProfileCustomPage => {
  return !!cp.url && !!cp.label && !!cp.mount && !!cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isCustomLink = (cp: CustomPage): cp is UserProfileCustomLink => {
  return !!cp.url && !!cp.label && !cp.mount && !cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isReorderItem = (cp: CustomPage, validItems: string[]): cp is UserProfileReorderItem => {
  return (
    !cp.url && !cp.mount && !cp.unmount && !cp.mountIcon && !cp.unmountIcon && validItems.some(v => v === cp.label)
  );
};

const sanitizeCustomPageURL = (url: string): string => {
  if (!url) {
    throw new Error('URL is required for custom pages');
  }
  if (isValidUrl(url)) {
    throw new Error('Absolute URLs are not supported for custom pages');
  }
  return (url as string).charAt(0) === '/' && (url as string).length > 1 ? (url as string).substring(1) : url;
};

const sanitizeCustomLinkURL = (url: string): string => {
  if (!url) {
    throw new Error('URL is required for custom links');
  }
  if (isValidUrl(url)) {
    return url;
  }
  return (url as string).charAt(0) === '/' ? url : `/${url}`;
};

const assertExternalLinkAsRoot = (routes: NavbarRoute[]) => {
  if (routes[0].external) {
    throw new Error('The first route cannot be a custom external link component');
  }
};

const getUserProfileDefaultRoutes = (): GetDefaultRoutesReturnType => {
  const INITIAL_ROUTES: NavbarRoute[] = [
    {
      name: localizationKeys('userProfile.start.headerTitle__account'),
      id: 'account',
      icon: User,
      path: 'account',
    },
    {
      name: localizationKeys('userProfile.start.headerTitle__security'),
      id: 'security',
      icon: TickShield,
      path: 'account',
    },
  ];

  const pageToRootNavbarRouteMap: Record<string, NavbarRoute> = {
    profile: INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    'email-address': INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    'phone-number': INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    'connected-account': INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    'web3-wallet': INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    username: INITIAL_ROUTES.find(r => r.id === 'account') as NavbarRoute,
    'multi-factor': INITIAL_ROUTES.find(r => r.id === 'security') as NavbarRoute,
    password: INITIAL_ROUTES.find(r => r.id === 'security') as NavbarRoute,
  };

  const validReorderItemLabels: string[] = INITIAL_ROUTES.map(r => r.id);

  return { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels };
};

const getOrganizationProfileDefaultRoutes = (): GetDefaultRoutesReturnType => {
  const INITIAL_ROUTES: NavbarRoute[] = [
    {
      name: localizationKeys('organizationProfile.start.headerTitle__members'),
      id: 'members',
      icon: User,
      path: 'organization-members',
    },
    {
      name: localizationKeys('organizationProfile.start.headerTitle__settings'),
      id: 'settings',
      icon: CogFilled,
      path: 'organization-settings',
    },
  ];

  const pageToRootNavbarRouteMap: Record<string, NavbarRoute> = {
    'invite-members': INITIAL_ROUTES.find(r => r.id === 'members') as NavbarRoute,
    domain: INITIAL_ROUTES.find(r => r.id === 'settings') as NavbarRoute,
    profile: INITIAL_ROUTES.find(r => r.id === 'settings') as NavbarRoute,
    leave: INITIAL_ROUTES.find(r => r.id === 'settings') as NavbarRoute,
    delete: INITIAL_ROUTES.find(r => r.id === 'settings') as NavbarRoute,
  };

  const validReorderItemLabels: string[] = INITIAL_ROUTES.map(r => r.id);

  return { INITIAL_ROUTES, pageToRootNavbarRouteMap, validReorderItemLabels };
};
