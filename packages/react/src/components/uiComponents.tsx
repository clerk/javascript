import { logErrorInDevMode } from '@clerk/shared/utils';
import type {
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
  Without,
} from '@clerk/types';
import type { PropsWithChildren, ReactElement } from 'react';
import React, { createContext, createElement, useContext } from 'react';

import {
  organizationProfileLinkRenderedError,
  organizationProfilePageRenderedError,
  userButtonMenuActionRenderedError,
  userButtonMenuItemsRenderedError,
  userButtonMenuLinkRenderedError,
  userProfileLinkRenderedError,
  userProfilePageRenderedError,
} from '../errors/messages';
import type {
  CustomPortalsRendererProps,
  MountProps,
  OrganizationProfileLinkProps,
  OrganizationProfilePageProps,
  UserButtonActionProps,
  UserButtonLinkProps,
  UserProfileLinkProps,
  UserProfilePageProps,
  WithClerkProp,
} from '../types';
import {
  useOrganizationProfileCustomPages,
  useSanitizedChildren,
  useUserButtonCustomMenuItems,
  useUserProfileCustomPages,
} from '../utils';
import { useWaitForComponentMount } from '../utils/useWaitForComponentMount';
import { ClerkHostRenderer } from './ClerkHostRenderer';
import { withClerk } from './withClerk';

type FallbackProp = {
  /**
   * An optional element to render while the component is mounting.
   */
  fallback?: ReactElement;
};

type UserProfileExportType = typeof _UserProfile & {
  Page: typeof UserProfilePage;
  Link: typeof UserProfileLink;
};

type UserButtonExportType = typeof _UserButton & {
  UserProfilePage: typeof UserProfilePage;
  UserProfileLink: typeof UserProfileLink;
  MenuItems: typeof MenuItems;
  Action: typeof MenuAction;
  Link: typeof MenuLink;
  /**
   * The `<Outlet />` component can be used in conjunction with `asProvider` in order to control rendering
   * of the `<OrganizationSwitcher />` without affecting its configuration or any custom pages
   * that could be mounted
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_Outlet: typeof UserButtonOutlet;
};

type UserButtonPropsWithoutCustomPages = Without<
  UserButtonProps,
  'userProfileProps' | '__experimental_asStandalone'
> & {
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance'>;
  /**
   * Adding `asProvider` will defer rendering until the `<Outlet />` component is mounted.
   * @experimental This API is experimental and may change at any moment.
   * @default undefined
   */
  __experimental_asProvider?: boolean;
};

type OrganizationProfileExportType = typeof _OrganizationProfile & {
  Page: typeof OrganizationProfilePage;
  Link: typeof OrganizationProfileLink;
};

type OrganizationSwitcherExportType = typeof _OrganizationSwitcher & {
  OrganizationProfilePage: typeof OrganizationProfilePage;
  OrganizationProfileLink: typeof OrganizationProfileLink;
  /**
   * The `<Outlet />` component can be used in conjunction with `asProvider` in order to control rendering
   * of the `<OrganizationSwitcher />` without affecting its configuration or any custom pages
   * that could be mounted
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_Outlet: typeof OrganizationSwitcherOutlet;
};

type OrganizationSwitcherPropsWithoutCustomPages = Without<
  OrganizationSwitcherProps,
  'organizationProfileProps' | '__experimental_asStandalone'
> & {
  organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance'>;
  /**
   * Adding `asProvider` will defer rendering until the `<Outlet />` component is mounted.
   * @experimental This API is experimental and may change at any moment.
   * @default undefined
   */
  __experimental_asProvider?: boolean;
};

const CustomPortalsRenderer = (props: CustomPortalsRendererProps) => {
  return (
    <>
      {props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}
      {props?.customMenuItemsPortals?.map((portal, index) => createElement(portal, { key: index }))}
    </>
  );
};

export const SignIn = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<SignInProps & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

    return (
      <>
        {shouldShowFallback && fallback}
        {clerk.loaded && (
          <ClerkHostRenderer
            component={component}
            mount={clerk.mountSignIn}
            unmount={clerk.unmountSignIn}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'SignIn', renderWhileLoading: true },
);

export const SignUp = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<SignUpProps & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

    return (
      <>
        {shouldShowFallback && fallback}
        {clerk.loaded && (
          <ClerkHostRenderer
            component={component}
            mount={clerk.mountSignUp}
            unmount={clerk.unmountSignUp}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'SignUp', renderWhileLoading: true },
);

export function UserProfilePage({ children }: PropsWithChildren<UserProfilePageProps>) {
  logErrorInDevMode(userProfilePageRenderedError);
  return <>{children}</>;
}

export function UserProfileLink({ children }: PropsWithChildren<UserProfileLinkProps>) {
  logErrorInDevMode(userProfileLinkRenderedError);
  return <>{children}</>;
}

const _UserProfile = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<Without<UserProfileProps, 'customPages'>>>) => {
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    return (
      <ClerkHostRenderer
        mount={clerk.mountUserProfile}
        unmount={clerk.unmountUserProfile}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, customPages }}
      >
        <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
      </ClerkHostRenderer>
    );
  },
  'UserProfile',
);

export const UserProfile: UserProfileExportType = Object.assign(_UserProfile, {
  Page: UserProfilePage,
  Link: UserProfileLink,
});

const UserButtonContext = createContext<MountProps>({
  mount: () => {},
  unmount: () => {},
  updateProps: () => {},
});

const _UserButton = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<UserButtonPropsWithoutCustomPages>>) => {
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider,
    });
    const userProfileProps = Object.assign(props.userProfileProps || {}, { customPages });
    const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children);
    const sanitizedChildren = useSanitizedChildren(props.children);

    const passableProps = {
      mount: clerk.mountUserButton,
      unmount: clerk.unmountUserButton,
      updateProps: (clerk as any).__unstable__updateProps,
      props: { ...props, userProfileProps, customMenuItems },
    };
    const portalProps = {
      customPagesPortals: customPagesPortals,
      customMenuItemsPortals: customMenuItemsPortals,
    };

    return (
      <UserButtonContext.Provider value={passableProps}>
        <ClerkHostRenderer
          {...passableProps}
          hideRootHtmlElement={!!props.__experimental_asProvider}
        >
          {/*This mimics the previous behaviour before asProvider existed*/}
          {props.__experimental_asProvider ? sanitizedChildren : null}
          <CustomPortalsRenderer {...portalProps} />
        </ClerkHostRenderer>
      </UserButtonContext.Provider>
    );
  },
  'UserButton',
);

export function MenuItems({ children }: PropsWithChildren) {
  logErrorInDevMode(userButtonMenuItemsRenderedError);
  return <>{children}</>;
}

export function MenuAction({ children }: PropsWithChildren<UserButtonActionProps>) {
  logErrorInDevMode(userButtonMenuActionRenderedError);
  return <>{children}</>;
}

export function MenuLink({ children }: PropsWithChildren<UserButtonLinkProps>) {
  logErrorInDevMode(userButtonMenuLinkRenderedError);
  return <>{children}</>;
}

export function UserButtonOutlet(outletProps: Without<UserButtonProps, 'userProfileProps'>) {
  const providerProps = useContext(UserButtonContext);

  const portalProps = {
    ...providerProps,
    props: {
      ...providerProps.props,
      ...outletProps,
    },
  } satisfies MountProps;

  return <ClerkHostRenderer {...portalProps} />;
}

export const UserButton: UserButtonExportType = Object.assign(_UserButton, {
  UserProfilePage,
  UserProfileLink,
  MenuItems,
  Action: MenuAction,
  Link: MenuLink,
  __experimental_Outlet: UserButtonOutlet,
});

export function OrganizationProfilePage({ children }: PropsWithChildren<OrganizationProfilePageProps>) {
  logErrorInDevMode(organizationProfilePageRenderedError);
  return <>{children}</>;
}

export function OrganizationProfileLink({ children }: PropsWithChildren<OrganizationProfileLinkProps>) {
  logErrorInDevMode(organizationProfileLinkRenderedError);
  return <>{children}</>;
}

const _OrganizationProfile = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<Without<OrganizationProfileProps, 'customPages'>>>) => {
    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
    return (
      <ClerkHostRenderer
        mount={clerk.mountOrganizationProfile}
        unmount={clerk.unmountOrganizationProfile}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, customPages }}
      >
        <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
      </ClerkHostRenderer>
    );
  },
  'OrganizationProfile',
);

export const OrganizationProfile: OrganizationProfileExportType = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink,
});

export const CreateOrganization = withClerk(({ clerk, ...props }: WithClerkProp<CreateOrganizationProps>) => {
  return (
    <ClerkHostRenderer
      mount={clerk.mountCreateOrganization}
      unmount={clerk.unmountCreateOrganization}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'CreateOrganization');

const OrganizationSwitcherContext = createContext<MountProps>({
  mount: () => {},
  unmount: () => {},
  updateProps: () => {},
});

const _OrganizationSwitcher = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<OrganizationSwitcherPropsWithoutCustomPages>>) => {
    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider,
    });
    const organizationProfileProps = Object.assign(props.organizationProfileProps || {}, { customPages });
    const sanitizedChildren = useSanitizedChildren(props.children);

    const passableProps = {
      mount: clerk.mountOrganizationSwitcher,
      unmount: clerk.unmountOrganizationSwitcher,
      updateProps: (clerk as any).__unstable__updateProps,
      props: { ...props, organizationProfileProps },
    };

    /**
     * Prefetch organization list
     */
    clerk.__experimental_prefetchOrganizationSwitcher();

    return (
      <OrganizationSwitcherContext.Provider value={passableProps}>
        <ClerkHostRenderer
          {...passableProps}
          hideRootHtmlElement={!!props.__experimental_asProvider}
        >
          {/*This mimics the previous behaviour before asProvider existed*/}
          {props.__experimental_asProvider ? sanitizedChildren : null}
          <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
        </ClerkHostRenderer>
      </OrganizationSwitcherContext.Provider>
    );
  },
  'OrganizationSwitcher',
);

export function OrganizationSwitcherOutlet(
  outletProps: Without<OrganizationSwitcherProps, 'organizationProfileProps'>,
) {
  const providerProps = useContext(OrganizationSwitcherContext);

  const portalProps = {
    ...providerProps,
    props: {
      ...providerProps.props,
      ...outletProps,
    },
  } satisfies MountProps;

  return <ClerkHostRenderer {...portalProps} />;
}

export const OrganizationSwitcher: OrganizationSwitcherExportType = Object.assign(_OrganizationSwitcher, {
  OrganizationProfilePage,
  OrganizationProfileLink,
  __experimental_Outlet: OrganizationSwitcherOutlet,
});

export const OrganizationList = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationListProps>) => {
  return (
    <ClerkHostRenderer
      mount={clerk.mountOrganizationList}
      unmount={clerk.unmountOrganizationList}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'OrganizationList');

export const GoogleOneTap = withClerk(({ clerk, ...props }: WithClerkProp<GoogleOneTapProps>) => {
  return (
    <ClerkHostRenderer
      open={clerk.openGoogleOneTap}
      close={clerk.closeGoogleOneTap}
      props={props}
    />
  );
}, 'GoogleOneTap');

export const Waitlist = withClerk(({ clerk, ...props }: WithClerkProp<WaitlistProps>) => {
  return (
    <ClerkHostRenderer
      mount={clerk.mountWaitlist}
      unmount={clerk.unmountWaitlist}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'Waitlist');
