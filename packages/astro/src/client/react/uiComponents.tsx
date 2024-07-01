import type {
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
} from '@clerk/types';
import React, { createElement } from 'react';

import { withClerk, type WithClerkProp } from './utils';

export interface MountProps {
  mount?: (node: HTMLDivElement, props: any) => void;
  unmount?: (node: HTMLDivElement) => void;
  updateProps?: (props: any) => void;
  props?: any;
  customPagesPortals?: any[];
}

class Portal extends React.PureComponent<MountProps> {
  private portalRef = React.createRef<HTMLDivElement>();

  componentDidUpdate(prevProps: Readonly<MountProps>) {
    if (
      prevProps.props.appearance !== this.props.props.appearance ||
      prevProps.props?.customPages?.length !== this.props.props?.customPages?.length
    ) {
      this.props.updateProps?.({
        node: this.portalRef.current,
        props: this.props.props,
      });
    }
  }

  componentDidMount() {
    if (this.portalRef.current) {
      this.props.mount?.(this.portalRef.current, this.props.props);
    }
  }

  componentWillUnmount() {
    if (this.portalRef.current) {
      this.props.unmount?.(this.portalRef.current);
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
      mount={clerk?.mountSignIn}
      unmount={clerk?.unmountSignIn}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'SignIn');

export const SignUp = withClerk(({ clerk, ...props }: WithClerkProp<SignUpProps>) => {
  return (
    <Portal
      mount={clerk?.mountSignUp}
      unmount={clerk?.unmountSignUp}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'SignUp');

export const UserButton = withClerk(({ clerk, ...props }: WithClerkProp<UserButtonProps>) => {
  return (
    <Portal
      mount={clerk?.mountUserButton}
      unmount={clerk?.unmountUserButton}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'UserButton');

export const UserProfile = withClerk(({ clerk, ...props }: WithClerkProp<UserProfileProps>) => {
  return (
    <Portal
      mount={clerk?.mountUserProfile}
      unmount={clerk?.unmountUserProfile}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'UserProfile');

export const OrganizationProfile = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationProfileProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationProfile}
      unmount={clerk?.unmountOrganizationProfile}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'OrganizationProfile');

export const OrganizationSwitcher = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationSwitcherProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationSwitcher}
      unmount={clerk?.unmountOrganizationSwitcher}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'OrganizationSwitcher');

export const OrganizationList = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationListProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationList}
      unmount={clerk?.unmountOrganizationList}
      updateProps={(clerk as any)?.__unstable__updateProps}
      props={props}
    />
  );
}, 'OrganizationList');
