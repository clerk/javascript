import { logErrorInDevMode, without } from '@clerk/shared';
import { isDeeplyEqual } from '@clerk/shared/react';
import type {
  __experimental_UserVerificationProps,
  CreateOrganizationProps,
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
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
import { useOrganizationProfileCustomPages, useUserButtonCustomMenuItems, useUserProfileCustomPages } from '../utils';
import { withClerk } from './withClerk';

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
  Body: () => React.JSX.Element;
};

type UserButtonPropsWithoutCustomPages = Without<UserButtonProps, 'userProfileProps'> & {
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance'>;
};

type OrganizationProfileExportType = typeof _OrganizationProfile & {
  Page: typeof OrganizationProfilePage;
  Link: typeof OrganizationProfileLink;
};

type OrganizationSwitcherExportType = typeof _OrganizationSwitcher & {
  OrganizationProfilePage: typeof OrganizationProfilePage;
  OrganizationProfileLink: typeof OrganizationProfileLink;
};

type OrganizationSwitcherPropsWithoutCustomPages = Without<OrganizationSwitcherProps, 'organizationProfileProps'> & {
  organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance'>;
};

// README: <Portal/> should be a class pure component in order for mount and unmount
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

const isMountProps = (props: any): props is MountProps => {
  return 'mount' in props;
};

const isOpenProps = (props: any): props is OpenProps => {
  return 'open' in props;
};

const CustomPortalsRenderer = (props: MountProps) => {
  if (!isMountProps(props)) {
    return null;
  }

  return (
    <>
      {props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}
      {props?.customMenuItemsPortals?.map((portal, index) => createElement(portal, { key: index }))}
    </>
  );
};

class Portal extends React.PureComponent<
  PropsWithChildren<(MountProps | OpenProps) & { renderHtmlElement?: boolean }>
> {
  private portalRef = React.createRef<HTMLDivElement>();

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

    console.log(prevProps, newProps, isDeeplyEqual(prevProps, newProps));
    if (!isDeeplyEqual(prevProps, newProps) || customPagesChanged || customMenuItemsChanged) {
      // if (!this.props.props.withOutlet) {
      if (this.portalRef.current) {
        this.props.updateProps({ node: this.portalRef.current, props: this.props.props });
      }
      // }
    }
  }

  componentDidMount() {
    // if (this.props.props.withOutlet) {
    //   return;
    // }
    if (this.portalRef.current) {
      if (isMountProps(this.props)) {
        this.props.mount(this.portalRef.current, this.props.props);
      }

      if (isOpenProps(this.props)) {
        this.props.open(this.props.props);
      }
    }
  }

  componentWillUnmount() {
    // if (this.props.props.withOutlet) {
    //   return;
    // }
    if (this.portalRef.current) {
      if (isMountProps(this.props)) {
        this.props.unmount(this.portalRef.current);
      }
      if (isOpenProps(this.props)) {
        this.props.close();
      }
    }
  }

  render() {
    const { renderHtmlElement = true } = this.props;
    return (
      <>
        {/*{!this.props.props.withOutlet && <div ref={this.portalRef} />}*/}
        {renderHtmlElement && <div ref={this.portalRef} />}
        {/*{isMountProps(this.props) &&*/}
        {/*  this.props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}*/}
        {/*{isMountProps(this.props) &&*/}
        {/*  this.props?.customMenuItemsPortals?.map((portal, index) => createElement(portal, { key: index }))}*/}

        {this.props.children}

        {/*{this.props.props.withOutlet*/}
        {/*  ? React.Children.map(this.props.props.children, (child, index) => {*/}
        {/*      return child;*/}
        {/*      // Clone each child and pass additional props*/}
        {/*      return React.cloneElement(child, {*/}
        {/*        key: index, // always set a unique key when mapping*/}
        {/*        // additionalProp: `Value ${index + 1}`, // adding new props or modifying existing ones*/}
        {/*        ...this.props,*/}
        {/*      });*/}
        {/*    })*/}
        {/*  : null}*/}
      </>
    );
  }
}

// class Portal2 extends React.PureComponent<MountProps | OpenProps> {
//   private portalRef = React.createRef<HTMLDivElement>();
//
//   componentDidUpdate(_prevProps: Readonly<MountProps | OpenProps>) {
//     if (!isMountProps(_prevProps) || !isMountProps(this.props)) {
//       return;
//     }
//     console.log('portal2 update');
//
//     // Remove children and customPages from props before comparing
//     // children might hold circular references which deepEqual can't handle
//     // and the implementation of customPages or customMenuItems relies on props getting new references
//     const prevProps = without(_prevProps.props, 'customPages', 'customMenuItems', 'children');
//     const newProps = without(this.props.props, 'customPages', 'customMenuItems', 'children');
//     // instead, we simply use the length of customPages to determine if it changed or not
//     const customPagesChanged = prevProps.customPages?.length !== newProps.customPages?.length;
//     const customMenuItemsChanged = prevProps.customMenuItems?.length !== newProps.customMenuItems?.length;
//
//     console.log(prevProps, newProps, isDeeplyEqual(prevProps, newProps));
//     if (!isDeeplyEqual(prevProps, newProps) || customPagesChanged || customMenuItemsChanged) {
//       this.props.updateProps({ node: this.portalRef.current, props: this.props.props });
//     }
//   }
//
//   componentDidMount() {
//     console.log('portal2 mounted');
//     if (this.portalRef.current) {
//       if (isMountProps(this.props)) {
//         this.props.mount(this.portalRef.current, this.props.props);
//       }
//
//       if (isOpenProps(this.props)) {
//         this.props.open(this.props.props);
//       }
//     }
//   }
//
//   componentWillUnmount() {
//     console.log('portal2 unmounted');
//     if (this.portalRef.current) {
//       if (isMountProps(this.props)) {
//         this.props.unmount(this.portalRef.current);
//       }
//       if (isOpenProps(this.props)) {
//         this.props.close();
//       }
//     }
//   }
//
//   render() {
//     return (
//       <>
//         <div ref={this.portalRef} />
//       </>
//     );
//   }
// }

export const SignIn = withClerk(({ clerk, ...props }: WithClerkProp<SignInProps>) => {
  return (
    <Portal
      mount={clerk.mountSignIn}
      unmount={clerk.unmountSignIn}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'SignIn');

export const SignUp = withClerk(({ clerk, ...props }: WithClerkProp<SignUpProps>) => {
  return (
    <Portal
      mount={clerk.mountSignUp}
      unmount={clerk.unmountSignUp}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'SignUp');

export function UserProfilePage(_: PropsWithChildren<UserProfilePageProps>) {
  logErrorInDevMode(userProfilePageRenderedError);
  return null;
}

export function UserProfileLink(_: PropsWithChildren<UserProfileLinkProps>) {
  logErrorInDevMode(userProfileLinkRenderedError);
  return null;
}

const _UserProfile = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<Without<UserProfileProps, 'customPages'>>>) => {
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    return (
      <Portal
        mount={clerk.mountUserProfile}
        unmount={clerk.unmountUserProfile}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, customPages }}
        customPagesPortals={customPagesPortals}
      />
    );
  },
  'UserProfile',
);

export const UserProfile: UserProfileExportType = Object.assign(_UserProfile, {
  Page: UserProfilePage,
  Link: UserProfileLink,
});

// @ts-ignore
const UserButtonContext = createContext<MountProps>({});

const _UserButton = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<UserButtonPropsWithoutCustomPages>>) => {
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    const userProfileProps = Object.assign(props.userProfileProps || {}, { customPages });
    const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children);

    const passableProps = {
      mount: clerk.mountUserButton,
      unmount: clerk.unmountUserButton,
      updateProps: (clerk as any).__unstable__updateProps,
      props: { ...props, userProfileProps, customMenuItems },
      customPagesPortals: customPagesPortals,
      customMenuItemsPortals: customMenuItemsPortals,
    };

    return (
      <UserButtonContext.Provider
        value={{
          mount: clerk.mountUserButton,
          unmount: clerk.unmountUserButton,
          updateProps: (clerk as any).__unstable__updateProps,
          props: { ...props, userProfileProps, customMenuItems },
        }}
      >
        <Portal
          {...passableProps}
          renderHtmlElement={!props.__experimental_asStandalone}
        >
          {props.children}
          <CustomPortalsRenderer {...passableProps} />
        </Portal>
      </UserButtonContext.Provider>
    );
  },
  'UserButton',
);

export function MenuItems(_: PropsWithChildren) {
  logErrorInDevMode(userButtonMenuItemsRenderedError);
  return null;
}

export function MenuAction(_: PropsWithChildren<UserButtonActionProps>) {
  logErrorInDevMode(userButtonMenuActionRenderedError);
  return null;
}

export function MenuLink(_: PropsWithChildren<UserButtonLinkProps>) {
  logErrorInDevMode(userButtonMenuLinkRenderedError);
  return null;
}

export function UserButtonOutlet() {
  const props = useContext(UserButtonContext);
  return <Portal {...props} />;
}

export const UserButton: UserButtonExportType = Object.assign(_UserButton, {
  UserProfilePage,
  UserProfileLink,
  MenuItems,
  Action: MenuAction,
  Link: MenuLink,
  Body: UserButtonOutlet as () => React.JSX.Element,
});

export const __experimental_UserVerification = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<__experimental_UserVerificationProps>>) => {
    return (
      <Portal
        mount={clerk.__experimental_mountUserVerification}
        unmount={clerk.__experimental_unmountUserVerification}
        updateProps={(clerk as any).__unstable__updateProps}
        props={props}
      />
    );
  },
  '__experimental_UserVerification',
);

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
      <Portal
        mount={clerk.mountOrganizationProfile}
        unmount={clerk.unmountOrganizationProfile}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, customPages }}
        customPagesPortals={customPagesPortals}
      />
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
    <Portal
      mount={clerk.mountCreateOrganization}
      unmount={clerk.unmountCreateOrganization}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'CreateOrganization');

const _OrganizationSwitcher = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<OrganizationSwitcherPropsWithoutCustomPages>>) => {
    const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
    const organizationProfileProps = Object.assign(props.organizationProfileProps || {}, { customPages });

    return (
      <Portal
        mount={clerk.mountOrganizationSwitcher}
        unmount={clerk.unmountOrganizationSwitcher}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, organizationProfileProps }}
        customPagesPortals={customPagesPortals}
      />
    );
  },
  'OrganizationSwitcher',
);

export const OrganizationSwitcher: OrganizationSwitcherExportType = Object.assign(_OrganizationSwitcher, {
  OrganizationProfilePage,
  OrganizationProfileLink,
});

export const OrganizationList = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationListProps>) => {
  return (
    <Portal
      mount={clerk.mountOrganizationList}
      unmount={clerk.unmountOrganizationList}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'OrganizationList');

export const GoogleOneTap = withClerk(({ clerk, ...props }: WithClerkProp<GoogleOneTapProps>) => {
  return (
    <Portal
      open={clerk.openGoogleOneTap}
      close={clerk.closeGoogleOneTap}
      props={props}
    />
  );
}, 'GoogleOneTap');
