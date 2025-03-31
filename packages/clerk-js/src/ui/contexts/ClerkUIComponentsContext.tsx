import type {
  __experimental_CheckoutProps,
  __experimental_PricingTableProps,
  UserButtonProps,
  WaitlistProps,
} from '@clerk/types';
import type { ReactNode } from 'react';

import type { AvailableComponentName, AvailableComponentProps } from '../types';
import {
  __experimental_CheckoutContext,
  __experimental_PricingTableContext,
  CreateOrganizationContext,
  GoogleOneTapContext,
  OrganizationListContext,
  OrganizationProfileContext,
  OrganizationSwitcherContext,
  SignInContext,
  SignUpContext,
  UserButtonContext,
  UserProfileContext,
  UserVerificationContext,
  WaitlistContext,
} from './components';

export function ComponentContextProvider({
  componentName,
  props,
  children,
}: {
  componentName: AvailableComponentName;
  props: AvailableComponentProps;
  children: ReactNode;
}) {
  switch (componentName) {
    case 'SignIn':
      return <SignInContext.Provider value={{ componentName, ...props }}>{children}</SignInContext.Provider>;
    case 'SignUp':
      return <SignUpContext.Provider value={{ componentName, ...props }}>{children}</SignUpContext.Provider>;
    case 'UserProfile':
      return <UserProfileContext.Provider value={{ componentName, ...props }}>{children}</UserProfileContext.Provider>;
    case 'UserVerification':
      return (
        <UserVerificationContext.Provider value={{ componentName, ...props }}>
          {children}
        </UserVerificationContext.Provider>
      );
    case 'UserButton':
      return (
        <UserButtonContext.Provider value={{ componentName, ...(props as UserButtonProps) }}>
          {children}
        </UserButtonContext.Provider>
      );
    case 'OrganizationSwitcher':
      return (
        <OrganizationSwitcherContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationSwitcherContext.Provider>
      );
    case 'OrganizationList':
      return (
        <OrganizationListContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationListContext.Provider>
      );
    case 'OrganizationProfile':
      return (
        <OrganizationProfileContext.Provider value={{ componentName, ...props }}>
          {children}
        </OrganizationProfileContext.Provider>
      );
    case 'CreateOrganization':
      return (
        <CreateOrganizationContext.Provider value={{ componentName, ...props }}>
          {children}
        </CreateOrganizationContext.Provider>
      );
    case 'GoogleOneTap':
      return (
        <GoogleOneTapContext.Provider value={{ componentName, ...props }}>{children}</GoogleOneTapContext.Provider>
      );
    case 'Waitlist':
      return (
        <WaitlistContext.Provider value={{ componentName, ...(props as WaitlistProps) }}>
          {children}
        </WaitlistContext.Provider>
      );
    case 'PricingTable':
      return (
        <__experimental_PricingTableContext.Provider
          value={{ componentName, ...(props as __experimental_PricingTableProps) }}
        >
          {children}
        </__experimental_PricingTableContext.Provider>
      );
    case 'Checkout':
      return (
        <__experimental_CheckoutContext.Provider value={{ componentName, ...(props as __experimental_CheckoutProps) }}>
          {children}
        </__experimental_CheckoutContext.Provider>
      );
    default:
      throw new Error(`Unknown component context: ${componentName}`);
  }
}

export * from './components';
