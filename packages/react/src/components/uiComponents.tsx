import { without } from '@clerk/shared/object';
import { isDeeplyEqual } from '@clerk/shared/react';
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
import type { PropsWithChildren } from 'react';
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
  OpenProps,
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
import { withClerk } from './withClerk';

/**
 * Used to detect when a Clerk component has been added to the DOM.
 */
function waitForElementChildren(options: { root: HTMLElement | null; timeout?: number }) {
  const { root = document, timeout = 0 } = options;

  return new Promise<void>((resolve, reject) => {
    if (!root) {
      reject(new Error('No root element provided'));
      return;
    }

    // Check if the element already has child nodes
    const isElementAlreadyPresent = root?.childElementCount && root.childElementCount > 0;
    if (isElementAlreadyPresent) {
      resolve();
      return;
    }

    // Set up a MutationObserver to detect when the element has children
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          if (root?.childElementCount && root.childElementCount > 0) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      }
    });

    observer.observe(root, { childList: true });

    // Set up an optional timeout to reject the promise if the element never gets child nodes
    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for element children`));
      }, timeout);
    }
  });
}

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

const isMountProps = (props: any): props is MountProps => {
  return 'mount' in props;
};

const isOpenProps = (props: any): props is OpenProps => {
  return 'open' in props;
};

// README: <ClerkHostRenderer/> should be a class pure component in order for mount and unmount
// lifecycle props to be invoked correctly. Replacing the class component with a
// functional component wrapped with a React.memo is not identical to the original
// class implementation due to React intricacies such as the useEffect’s cleanup
// seems to run AFTER unmount, while componentWillUnmount runs BEFORE.

// More information can be found at https://clerk.slack.com/archives/C015S0BGH8R/p1624891993016300

// The function Portal implementation is commented out for future reference.

// const Portal = React.memo(({ props, mount, unmount }: MountProps) => {
//   const portalRef = React.createRef<HTMLDivElement>();

//   useEffect(() => {
//     if (portalRef.current) {
//       mount(portalRef.current, props);
//     }
//     return () => {
//       if (portalRef.current) {
//         unmount(portalRef.current);
//       }
//     };
//   }, []);

//   return <div ref={portalRef} />;
// });

// Portal.displayName = 'ClerkPortal';

/**
 * Used to orchestrate mounting of Clerk components in a host React application.
 * Components are rendered into a specific DOM node using mount/unmount methods provided by the Clerk class.
 */
class ClerkHostRenderer extends React.PureComponent<
  PropsWithChildren<(MountProps | OpenProps) & { component?: string; hideRootHtmlElement?: boolean }>
> {
  private rootRef = React.createRef<HTMLDivElement>();

  state = {
    rendering: true,
  };

  componentDidUpdate(_prevProps: Readonly<MountProps | OpenProps>) {
    if (!isMountProps(_prevProps) || !isMountProps(this.props)) {
      return;
    }

    // Remove children and customPages from props before comparing
    // children might hold circular references which deepEqual can't handle
    // and the implementation of customPages or customMenuItems relies on props getting new references
    const prevProps = without(_prevProps.props, 'customPages', 'customMenuItems', 'children');
    const newProps = without(this.props.props, 'customPages', 'customMenuItems', 'children');
    // instead, we simply use the length of customPages to determine if it changed or not
    const customPagesChanged = prevProps.customPages?.length !== newProps.customPages?.length;
    const customMenuItemsChanged = prevProps.customMenuItems?.length !== newProps.customMenuItems?.length;

    if (!isDeeplyEqual(prevProps, newProps) || customPagesChanged || customMenuItemsChanged) {
      if (this.rootRef.current) {
        this.props.updateProps({ node: this.rootRef.current, props: this.props.props });
      }
    }
  }

  componentDidMount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.mount(this.rootRef.current, this.props.props);
      }

      if (isOpenProps(this.props)) {
        this.props.open(this.props.props);
      }
    }

    // Watch for the element to be added to the DOM so we can render a fallback.
    if (this.props.component) {
      waitForElementChildren({ root: this.rootRef.current })
        .then(() => {
          this.setState({ rendering: false });
        })
        .catch(() => {
          this.setState({ rendering: false });
        });
    }
  }

  componentWillUnmount() {
    if (this.rootRef.current) {
      if (isMountProps(this.props)) {
        this.props.unmount(this.rootRef.current);
      }
      if (isOpenProps(this.props)) {
        this.props.close();
      }
    }
  }

  render() {
    const { hideRootHtmlElement = false } = this.props;
    const rootAttributes = {
      ref: this.rootRef,
      ...(this.props.component ? { 'data-clerk-component': this.props.component } : {}),
      ...(this.state.rendering && 'fallback' in this.props ? { style: { display: 'none' } } : {}),
    };

    return (
      <>
        {!hideRootHtmlElement && <div {...rootAttributes} />}
        {this.state.rendering && 'fallback' in this.props && this.props.fallback}
        {this.props.children}
      </>
    );
  }
}

const CustomPortalsRenderer = (props: CustomPortalsRendererProps) => {
  return (
    <>
      {props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}
      {props?.customMenuItemsPortals?.map((portal, index) => createElement(portal, { key: index }))}
    </>
  );
};

// @ts-expect-error -- FIXME
export const SignIn = withClerk(({ clerk, fallback, ...props }: WithClerkProp<SignInProps>) => {
  return (
    <ClerkHostRenderer
      component='SignIn'
      mount={clerk.mountSignIn}
      unmount={clerk.unmountSignIn}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
      fallback={fallback}
    />
  );
}, 'SignIn');

export const SignUp = withClerk(({ clerk, ...props }: WithClerkProp<SignUpProps>) => {
  return (
    <ClerkHostRenderer
      mount={clerk.mountSignUp}
      unmount={clerk.unmountSignUp}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'SignUp');

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
