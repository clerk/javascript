import type {
  GoogleOneTapProps,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationSwitcherProps,
  PricingTableProps,
  SignInProps,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
} from '@clerk/shared/types';
import React from 'react';

import { withClerk, type WithClerkProp } from './utils';

export interface OpenProps {
  open: ((props: any) => void) | undefined;
  close: (() => void) | undefined;
  props?: any;
}

export interface MountProps {
  mount: ((node: HTMLDivElement, props: any) => void) | undefined;
  unmount: ((node: HTMLDivElement) => void) | undefined;
  updateProps?: (props: any) => void;
  props?: any;
  // TODO: Support custom pages
  // customPagesPortals?: any[];
}

const isMountProps = (props: any): props is MountProps => {
  return 'mount' in props;
};

const isOpenProps = (props: any): props is OpenProps => {
  return 'open' in props;
};

class Portal extends React.PureComponent<MountProps | OpenProps> {
  private portalRef = React.createRef<HTMLDivElement>();

  componentDidUpdate(prevProps: Readonly<MountProps>) {
    if (!isMountProps(prevProps) || !isMountProps(this.props)) {
      return;
    }
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
      if (isMountProps(this.props)) {
        this.props.mount?.(this.portalRef.current, this.props.props);
      }

      if (isOpenProps(this.props)) {
        this.props.open?.(this.props.props);
      }
    }
  }

  componentWillUnmount() {
    if (this.portalRef.current) {
      if (isMountProps(this.props)) {
        this.props.unmount?.(this.portalRef.current);
      }
      if (isOpenProps(this.props)) {
        this.props.close?.();
      }
    }
  }

  render() {
    return (
      <>
        <div ref={this.portalRef} />
        {/*TODO: Support custom pages*/}
        {/*{isMountProps(this.props) &&*/}
        {/*  this.props?.customPagesPortals?.map((portal, index) => createElement(portal, { key: index }))}*/}
      </>
    );
  }
}

export const SignIn = withClerk(({ clerk, ...props }: WithClerkProp<SignInProps>) => {
  return (
    <Portal
      mount={clerk?.mountSignIn}
      unmount={clerk?.unmountSignIn}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'SignIn');

export const SignUp = withClerk(({ clerk, ...props }: WithClerkProp<SignUpProps>) => {
  return (
    <Portal
      mount={clerk?.mountSignUp}
      unmount={clerk?.unmountSignUp}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'SignUp');

export const UserButton = withClerk(({ clerk, ...props }: WithClerkProp<UserButtonProps>) => {
  return (
    <Portal
      mount={clerk?.mountUserButton}
      unmount={clerk?.unmountUserButton}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'UserButton');

export const UserProfile = withClerk(({ clerk, ...props }: WithClerkProp<UserProfileProps>) => {
  return (
    <Portal
      mount={clerk?.mountUserProfile}
      unmount={clerk?.unmountUserProfile}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'UserProfile');

export const OrganizationProfile = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationProfileProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationProfile}
      unmount={clerk?.unmountOrganizationProfile}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'OrganizationProfile');

export const OrganizationSwitcher = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationSwitcherProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationSwitcher}
      unmount={clerk?.unmountOrganizationSwitcher}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'OrganizationSwitcher');

export const OrganizationList = withClerk(({ clerk, ...props }: WithClerkProp<OrganizationListProps>) => {
  return (
    <Portal
      mount={clerk?.mountOrganizationList}
      unmount={clerk?.unmountOrganizationList}
      updateProps={(clerk as any)?.__internal__updateProps}
      props={props}
    />
  );
}, 'OrganizationList');

export const GoogleOneTap = withClerk(({ clerk, ...props }: WithClerkProp<GoogleOneTapProps>) => {
  return (
    <Portal
      open={clerk?.openGoogleOneTap}
      close={clerk?.closeGoogleOneTap}
      props={props}
    />
  );
}, 'GoogleOneTap');

export const Waitlist = withClerk(({ clerk, ...props }: WithClerkProp<WaitlistProps>) => {
  return (
    <Portal
      mount={clerk?.mountWaitlist}
      unmount={clerk?.unmountWaitlist}
      props={props}
    />
  );
}, 'Waitlist');

export const PricingTable = withClerk(({ clerk, ...props }: WithClerkProp<PricingTableProps>) => {
  return (
    <Portal
      mount={clerk?.mountPricingTable}
      unmount={clerk?.unmountPricingTable}
      props={props}
    />
  );
}, 'PricingTable');
