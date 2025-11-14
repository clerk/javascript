import type {
  APIKeysProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  PricingTableProps,
  SignInProps,
  SignUpProps,
  TaskChooseOrganizationProps,
  UserAvatarProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
  Without,
} from '@clerk/shared/types';
import { logErrorInDevMode } from '@clerk/shared/utils';
import type { PropsWithChildren, ReactNode } from 'react';
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
  fallback?: ReactNode;
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
   * of the `<UserButton />` without affecting its configuration or any custom pages that could be mounted
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_Outlet: typeof UserButtonOutlet;
};

type UserButtonPropsWithoutCustomPages = Without<
  UserButtonProps,
  'userProfileProps' | '__experimental_asStandalone'
> & {
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance' | 'apiKeysProps'>;
  /**
   * Adding `asProvider` will defer rendering until the `<Outlet />` component is mounted.
   *
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
   * of the `<OrganizationSwitcher />` without affecting its configuration or any custom pages that could be mounted
   *
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
   *
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
  ({
    clerk,
    component,
    fallback,
    ...props
  }: WithClerkProp<PropsWithChildren<Without<UserProfileProps, 'customPages'>> & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    return (
      <>
        {shouldShowFallback && fallback}
        <ClerkHostRenderer
          component={component}
          mount={clerk.mountUserProfile}
          unmount={clerk.unmountUserProfile}
          updateProps={(clerk as any).__unstable__updateProps}
          props={{ ...props, customPages }}
          rootProps={rendererRootProps}
        >
          <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
        </ClerkHostRenderer>
      </>
    );
  },
  { component: 'UserProfile', renderWhileLoading: true },
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
  ({
    clerk,
    component,
    fallback,
    ...props
  }: WithClerkProp<PropsWithChildren<UserButtonPropsWithoutCustomPages> & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider,
    });
    const userProfileProps = Object.assign(props.userProfileProps || {}, { customPages });
    const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children, {
      allowForAnyChildren: !!props.__experimental_asProvider,
    });
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
        {shouldShowFallback && fallback}
        {clerk.loaded && (
          <ClerkHostRenderer
            component={component}
            {...passableProps}
            hideRootHtmlElement={!!props.__experimental_asProvider}
            rootProps={rendererRootProps}
          >
            {/*This mimics the previous behaviour before asProvider existed*/}
            {props.__experimental_asProvider ? sanitizedChildren : null}
            <CustomPortalsRenderer {...portalProps} />
          </ClerkHostRenderer>
        )}
      </UserButtonContext.Provider>
    );
  },
  { component: 'UserButton', renderWhileLoading: true },
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
  ({
    clerk,
    component,
    fallback,
    ...props
  }: WithClerkProp<PropsWithChildren<Without<OrganizationProfileProps, 'customPages'>> & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
    return (
      <>
        {shouldShowFallback && fallback}
        {clerk.loaded && (
          <ClerkHostRenderer
            component={component}
            mount={clerk.mountOrganizationProfile}
            unmount={clerk.unmountOrganizationProfile}
            updateProps={(clerk as any).__unstable__updateProps}
            props={{ ...props, customPages }}
            rootProps={rendererRootProps}
          >
            <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
          </ClerkHostRenderer>
        )}
      </>
    );
  },
  { component: 'OrganizationProfile', renderWhileLoading: true },
);

export const OrganizationProfile: OrganizationProfileExportType = Object.assign(_OrganizationProfile, {
  Page: OrganizationProfilePage,
  Link: OrganizationProfileLink,
});

export const CreateOrganization = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<CreateOrganizationProps & FallbackProp>) => {
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
            mount={clerk.mountCreateOrganization}
            unmount={clerk.unmountCreateOrganization}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'CreateOrganization', renderWhileLoading: true },
);

const OrganizationSwitcherContext = createContext<MountProps>({
  mount: () => {},
  unmount: () => {},
  updateProps: () => {},
});

const _OrganizationSwitcher = withClerk(
  ({
    clerk,
    component,
    fallback,
    ...props
  }: WithClerkProp<PropsWithChildren<OrganizationSwitcherPropsWithoutCustomPages> & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component);
    const shouldShowFallback = mountingStatus === 'rendering' || !clerk.loaded;

    const rendererRootProps = {
      ...(shouldShowFallback && fallback && { style: { display: 'none' } }),
    };

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
      rootProps: rendererRootProps,
      component,
    };

    /**
     * Prefetch organization list
     */
    clerk.__experimental_prefetchOrganizationSwitcher();

    return (
      <OrganizationSwitcherContext.Provider value={passableProps}>
        <>
          {shouldShowFallback && fallback}
          {clerk.loaded && (
            <ClerkHostRenderer
              {...passableProps}
              hideRootHtmlElement={!!props.__experimental_asProvider}
            >
              {/*This mimics the previous behaviour before asProvider existed*/}
              {props.__experimental_asProvider ? sanitizedChildren : null}
              <CustomPortalsRenderer customPagesPortals={customPagesPortals} />
            </ClerkHostRenderer>
          )}
        </>
      </OrganizationSwitcherContext.Provider>
    );
  },
  { component: 'OrganizationSwitcher', renderWhileLoading: true },
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

export const OrganizationList = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<OrganizationListProps & FallbackProp>) => {
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
            mount={clerk.mountOrganizationList}
            unmount={clerk.unmountOrganizationList}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'OrganizationList', renderWhileLoading: true },
);

export const GoogleOneTap = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<GoogleOneTapProps & FallbackProp>) => {
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
            open={clerk.openGoogleOneTap}
            close={clerk.closeGoogleOneTap}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'GoogleOneTap', renderWhileLoading: true },
);

export const Waitlist = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<WaitlistProps & FallbackProp>) => {
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
            mount={clerk.mountWaitlist}
            unmount={clerk.unmountWaitlist}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'Waitlist', renderWhileLoading: true },
);

export const PricingTable = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<PricingTableProps & FallbackProp>) => {
    const mountingStatus = useWaitForComponentMount(component, {
      // This attribute is added to the PricingTable root element after we've successfully fetched the plans asynchronously.
      selector: '[data-component-status="ready"]',
    });
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
            mount={clerk.mountPricingTable}
            unmount={clerk.unmountPricingTable}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'PricingTable', renderWhileLoading: true },
);

/**
 * @experimental This component is in early access and may change in future releases.
 */
export const APIKeys = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<APIKeysProps & FallbackProp>) => {
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
            mount={clerk.mountAPIKeys}
            unmount={clerk.unmountAPIKeys}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'ApiKeys', renderWhileLoading: true },
);

export const UserAvatar = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<UserAvatarProps & FallbackProp>) => {
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
            mount={clerk.mountUserAvatar}
            unmount={clerk.unmountUserAvatar}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'UserAvatar', renderWhileLoading: true },
);

export const TaskChooseOrganization = withClerk(
  ({ clerk, component, fallback, ...props }: WithClerkProp<TaskChooseOrganizationProps & FallbackProp>) => {
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
            mount={clerk.mountTaskChooseOrganization}
            unmount={clerk.unmountTaskChooseOrganization}
            updateProps={(clerk as any).__unstable__updateProps}
            props={props}
            rootProps={rendererRootProps}
          />
        )}
      </>
    );
  },
  { component: 'TaskChooseOrganization', renderWhileLoading: true },
);
