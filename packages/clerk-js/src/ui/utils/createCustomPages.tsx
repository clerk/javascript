import { isDevelopmentEnvironment } from '@clerk/shared';
import type { CustomPage } from '@clerk/types';

import { isValidUrl } from '../../utils';
import type { NavbarRoute } from '../elements';
import { TickShield, User } from '../icons';
import { localizationKeys } from '../localization';
import { ExternalElementMounter } from './ExternalElementMounter';

const CLERK_ACCOUNT_ROUTE: NavbarRoute = {
  name: localizationKeys('userProfile.start.headerTitle__account'),
  id: 'account',
  icon: User,
  path: 'account',
};

const CLERK_SECURITY_ROUTE: NavbarRoute = {
  name: localizationKeys('userProfile.start.headerTitle__security'),
  id: 'security',
  icon: TickShield,
  path: 'account',
};

export const pageToRootNavbarRouteMap = {
  profile: CLERK_ACCOUNT_ROUTE,
  'email-address': CLERK_ACCOUNT_ROUTE,
  'phone-number': CLERK_ACCOUNT_ROUTE,
  'connected-account': CLERK_ACCOUNT_ROUTE,
  'web3-wallet': CLERK_ACCOUNT_ROUTE,
  username: CLERK_ACCOUNT_ROUTE,
  'multi-factor': CLERK_SECURITY_ROUTE,
  password: CLERK_SECURITY_ROUTE,
};

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

export const createCustomPages = (customPages: CustomPage[]) => {
  if (isDevelopmentEnvironment()) {
    checkForDuplicateUsageOfReorderingItems(customPages);
  }

  const validCustomPages = customPages.filter(cp => {
    if (!isValidPageItem(cp)) {
      if (isDevelopmentEnvironment()) {
        console.error('Invalid custom page data: ', cp);
      }
      return false;
    }
    return true;
  });

  const { allRoutes, contents } = getRoutesAndContents(validCustomPages);

  assertExternalLinkAsRoot(allRoutes);

  const routes = setFirstPathToRoot(allRoutes);

  if (isDevelopmentEnvironment()) {
    warnForDuplicatePaths(routes);
  }

  return { routes, contents, isAccountPageRoot: routes[0].id === 'account' || routes[0].id === 'security' };
};

const getRoutesAndContents = (customPages: CustomPage[]) => {
  let clerkDefaultRoutes: NavbarRoute[] = [{ ...CLERK_ACCOUNT_ROUTE }, { ...CLERK_SECURITY_ROUTE }];
  const CLERK_ROUTES = {
    account: CLERK_ACCOUNT_ROUTE,
    security: CLERK_SECURITY_ROUTE,
  };
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
    const reorderItem = CLERK_ROUTES[cp.label as 'account' | 'security'];
    clerkDefaultRoutes = clerkDefaultRoutes.filter(({ id }) => id !== cp.label);
    return { ...reorderItem };
  });

  const allRoutes = [...clerkDefaultRoutes, ...routesWithoutDefaults];

  return { allRoutes, contents };
};

// Set the path of the first route to '/' or if the first route is account or security, set the path of both account and security to '/'
const setFirstPathToRoot = (routes: NavbarRoute[]) => {
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

const checkForDuplicateUsageOfReorderingItems = (customPages: CustomPage[]) => {
  const reorderItems = customPages.filter(cp => isAccountReorderItem(cp) || isSecurityReorderItem(cp));
  reorderItems.reduce((acc, cp) => {
    if (acc.includes(cp.label)) {
      console.error(
        `The "${cp.label}" item is used more than once when reordering UserProfile pages. This may cause unexpected behavior.`,
      );
    }
    return [...acc, cp.label];
  }, [] as string[]);
};

const warnForDuplicatePaths = (routes: NavbarRoute[]) => {
  const paths = routes
    .filter(({ external, path }) => !external && path !== '/' && path !== 'account')
    .map(({ path }) => path);
  const duplicatePaths = paths.filter((p, index) => paths.indexOf(p) !== index);
  duplicatePaths.forEach(p => {
    console.error(`Duplicate path "${p}" found in custom pages. This may cause unexpected behavior.`);
  });
};

const isValidPageItem = (cp: CustomPage): cp is CustomPage => {
  return isCustomPage(cp) || isCustomLink(cp) || isAccountReorderItem(cp) || isSecurityReorderItem(cp);
};

const isCustomPage = (cp: CustomPage): cp is UserProfileCustomPage => {
  return !!cp.url && !!cp.label && !!cp.mount && !!cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isCustomLink = (cp: CustomPage): cp is UserProfileCustomLink => {
  return !!cp.url && !!cp.label && !cp.mount && !cp.unmount && !!cp.mountIcon && !!cp.unmountIcon;
};

const isAccountReorderItem = (cp: CustomPage): cp is UserProfileReorderItem => {
  return !cp.url && !cp.mount && !cp.unmount && !cp.mountIcon && !cp.unmountIcon && cp.label === 'account';
};

const isSecurityReorderItem = (cp: CustomPage): cp is UserProfileReorderItem => {
  return !cp.url && !cp.mount && !cp.unmount && !cp.mountIcon && !cp.unmountIcon && cp.label === 'security';
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
    throw new Error('The first route cannot be a <UserProfile.Link /> component');
  }
};
