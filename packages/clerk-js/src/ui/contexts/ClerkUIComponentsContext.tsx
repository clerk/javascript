import type {
  __internal_OAuthConsentProps,
  APIKeysProps,
  PricingTableProps,
  TaskChooseOrganizationProps,
  TaskResetPasswordProps,
  TaskSetupMFAProps,
  UserButtonProps,
  WaitlistProps,
} from '@clerk/shared/types';
import type { ReactNode } from 'react';

import type { AvailableComponentName, AvailableComponentProps } from '../types';
import {
  APIKeysContext,
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
  UserAvatarContext,
  UserButtonContext,
  UserProfileContext,
  UserVerificationContext,
  WaitlistContext,
} from './components';
import {
  SessionTasksContext,
  TaskChooseOrganizationContext,
  TaskResetPasswordContext,
  TaskSetupMFAContext,
} from './components/SessionTasks';

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
    case 'UserAvatar':
      return <UserAvatarContext.Provider value={{ componentName, ...props }}>{children}</UserAvatarContext.Provider>;
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
        <SubscriberTypeContext.Provider
          value={
            // Backward compatibility: support legacy `forOrganizations: true`
            (props as any).forOrganizations ? 'organization' : (props as PricingTableProps).for || 'user'
          }
        >
          <PricingTableContext.Provider value={{ componentName, ...(props as PricingTableProps) }}>
            {children}
          </PricingTableContext.Provider>
        </SubscriberTypeContext.Provider>
      );
    case 'APIKeys':
      return (
        <APIKeysContext.Provider value={{ componentName, ...(props as APIKeysProps) }}>
          {children}
        </APIKeysContext.Provider>
      );
    case 'OAuthConsent':
      return (
        <OAuthConsentContext.Provider value={{ componentName, ...(props as __internal_OAuthConsentProps) }}>
          {children}
        </OAuthConsentContext.Provider>
      );
    case 'TaskChooseOrganization':
      return (
        <TaskChooseOrganizationContext.Provider
          value={{ componentName: 'TaskChooseOrganization', ...(props as TaskChooseOrganizationProps) }}
        >
          <SessionTasksContext.Provider value={{ ...(props as TaskChooseOrganizationProps) }}>
            {children}
          </SessionTasksContext.Provider>
        </TaskChooseOrganizationContext.Provider>
      );
    case 'TaskResetPassword':
      return (
        <TaskResetPasswordContext.Provider
          value={{ componentName: 'TaskResetPassword', ...(props as TaskResetPasswordProps) }}
        >
          <SessionTasksContext.Provider value={{ ...(props as TaskResetPasswordProps) }}>
            {children}
          </SessionTasksContext.Provider>
        </TaskResetPasswordContext.Provider>
      );
    case 'TaskSetupMFA':
      return (
        <TaskSetupMFAContext.Provider value={{ componentName: 'TaskSetupMFA', ...(props as TaskSetupMFAProps) }}>
          <SessionTasksContext.Provider value={{ ...(props as TaskSetupMFAProps) }}>
            {children}
          </SessionTasksContext.Provider>
        </TaskSetupMFAContext.Provider>
      );
    default:
      throw new Error(`Unknown component context: ${componentName}`);
  }
}

export * from './components';
