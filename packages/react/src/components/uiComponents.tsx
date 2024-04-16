import { logErrorInDevMode } from '@clerk/shared';
import type {
  CreateOrganizationProps,
  OneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';
import type { PropsWithChildren } from 'react';
import React, { createElement } from 'react';

import {
  organizationProfileLinkRenderedError,
  organizationProfilePageRenderedError,
  userProfileLinkRenderedError,
  userProfilePageRenderedError,
} from '../errors';
import type {
  MountProps,
  OrganizationProfileLinkProps,
  OrganizationProfilePageProps,
  UserProfileLinkProps,
  UserProfilePageProps,
  WithClerkProp,
} from '../types';
import { useOrganizationProfileCustomPages, useUserProfileCustomPages } from '../utils';
import { withClerk } from './withClerk';

type UserProfileExportType = typeof _UserProfile & {
  Page: typeof UserProfilePage;
  Link: typeof UserProfileLink;
};

type UserButtonExportType = typeof _UserButton & {
  UserProfilePage: typeof UserProfilePage;
  UserProfileLink: typeof UserProfileLink;
};

type UserButtonPropsWithoutCustomPages = Omit<UserButtonProps, 'userProfileProps'> & {
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

type OrganizationSwitcherPropsWithoutCustomPages = Omit<OrganizationSwitcherProps, 'organizationProfileProps'> & {
  organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance'>;
};

// README: <Portal/> should be a class pure component in order for mount and unmount
// lifecycle props to be invoked correctly. Replacing the class component with a
// functional component wrapped with a React.memo is not identical to the original
// class implementation due to React intricacies such as the useEffect’s cleanup
// seems to run AFTER unmount, while componentWillUnmount runs BEFORE.

// More information can be found at https://clerkinc.slack.com/archives/C015S0BGH8R/p1624891993016300

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
class Portal extends React.PureComponent<MountProps> {
  private portalRef = React.createRef<HTMLDivElement>();

  componentDidUpdate(prevProps: Readonly<MountProps>) {
    if (
      prevProps.props.appearance !== this.props.props.appearance ||
      prevProps.props?.customPages?.length !== this.props.props?.customPages?.length
    ) {
      this.props.updateProps({ node: this.portalRef.current, props: this.props.props });
    }
  }

  componentDidMount() {
    if (this.portalRef.current) {
      this.props.mount(this.portalRef.current, this.props.props);
    }
  }

  componentWillUnmount() {
    if (this.portalRef.current) {
      this.props.unmount(this.portalRef.current);
    }
  }

  render() {
    return (
      <>
        <div ref={this.portalRef} />
        {this.props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}
      </>
    );
  }
}

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

export function UserProfilePage({ children }: PropsWithChildren<UserProfilePageProps>) {
  logErrorInDevMode(userProfilePageRenderedError);
  return <>{children}</>;
}

export function UserProfileLink({ children }: PropsWithChildren<UserProfileLinkProps>) {
  logErrorInDevMode(userProfileLinkRenderedError);
  return <>{children}</>;
}

const _UserProfile = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<Omit<UserProfileProps, 'customPages'>>>) => {
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

const _UserButton = withClerk(
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<UserButtonPropsWithoutCustomPages>>) => {
    const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
    const userProfileProps = Object.assign(props.userProfileProps || {}, { customPages });
    return (
      <Portal
        mount={clerk.mountUserButton}
        unmount={clerk.unmountUserButton}
        updateProps={(clerk as any).__unstable__updateProps}
        props={{ ...props, userProfileProps }}
        customPagesPortals={customPagesPortals}
      />
    );
  },
  'UserButton',
);

export const UserButton: UserButtonExportType = Object.assign(_UserButton, {
  UserProfilePage,
  UserProfileLink,
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
  ({ clerk, ...props }: WithClerkProp<PropsWithChildren<Omit<OrganizationProfileProps, 'customPages'>>>) => {
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

export const __experimental_GoogleOneTap = withClerk(({ clerk, ...props }: WithClerkProp<OneTapProps>) => {
  return (
    <Portal
      mount={clerk.__experimental_mountGoogleOneTap}
      unmount={clerk.__experimental_unmountGoogleOneTap}
      updateProps={(clerk as any).__unstable__updateProps}
      props={props}
    />
  );
}, 'OneTap');
