import type {
  __internal_OAuthConsentProps,
  APIKeysProps,
  PricingTableProps,
  UserButtonProps,
  WaitlistProps,
} from '@clerk/types';
import type { ReactNode } from 'react';

import type { AvailableComponentName, AvailableComponentProps } from '../types';
import {
  ApiKeysContext,
  CreateOrganizationContext,
  GoogleOneTapContext,
  OAuthConsentContext,
  OrganizationListContext,
  OrganizationProfileContext,
  OrganizationSwitcherContext,
  PricingTableContext,
  SignInContext,
  SignUpContext,
  SubscriberTypeContext,
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
        <SubscriberTypeContext.Provider value={(props as PricingTableProps).forOrganizations ? 'org' : 'user'}>
          <PricingTableContext.Provider value={{ componentName, ...(props as PricingTableProps) }}>
            {children}
          </PricingTableContext.Provider>
        </SubscriberTypeContext.Provider>
      );
    case 'APIKeys':
      return (
        <ApiKeysContext.Provider value={{ componentName, ...(props as APIKeysProps) }}>
          {children}
        </ApiKeysContext.Provider>
      );
    case 'OAuthConsent':
      return (
        <OAuthConsentContext.Provider value={{ componentName, ...(props as __internal_OAuthConsentProps) }}>
          {children}
        </OAuthConsentContext.Provider>
      );
    default:
      throw new Error(`Unknown component context: ${componentName}`);
  }
}

export * from './components';
