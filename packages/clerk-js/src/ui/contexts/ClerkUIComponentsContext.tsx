import type {
  __internal_OAuthConsentProps,
  APIKeysProps,
  PortalProps,
  PricingTableProps,
  TaskChooseOrganizationProps,
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
import { TaskChooseOrganizationContext } from './components/SessionTasks';
import { PortalProvider } from './PortalContext';

export function ComponentContextProvider({
  componentName,
  props,
  children,
}: {
  componentName: AvailableComponentName;
  props: AvailableComponentProps;
  children: ReactNode;
}) {
  // Extract portal props if present
  const portalProps: PortalProps | undefined =
    'disablePortal' in props || 'portalId' in props || 'portalRoot' in props
      ? {
          disablePortal: 'disablePortal' in props ? props.disablePortal : undefined,
          portalId: 'portalId' in props ? props.portalId : undefined,
          portalRoot:
            'portalRoot' in props && props.portalRoot !== null && props.portalRoot !== undefined
              ? props.portalRoot
              : undefined,
        }
      : undefined;

  // Remove portal props from component props
  const { disablePortal, portalId, portalRoot, ...componentProps } = props as PortalProps & AvailableComponentProps;

  const wrappedChildren = portalProps ? <PortalProvider {...portalProps}>{children}</PortalProvider> : children;

  switch (componentName) {
    case 'SignIn':
      return (
        <SignInContext.Provider value={{ componentName, ...componentProps }}>{wrappedChildren}</SignInContext.Provider>
      );
    case 'SignUp':
      return (
        <SignUpContext.Provider value={{ componentName, ...componentProps }}>{wrappedChildren}</SignUpContext.Provider>
      );
    case 'UserProfile':
      return (
        <UserProfileContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </UserProfileContext.Provider>
      );
    case 'UserVerification':
      return (
        <UserVerificationContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </UserVerificationContext.Provider>
      );
    case 'UserAvatar':
      return (
        <UserAvatarContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </UserAvatarContext.Provider>
      );
    case 'UserButton':
      return (
        <UserButtonContext.Provider value={{ componentName, ...(componentProps as UserButtonProps) }}>
          {wrappedChildren}
        </UserButtonContext.Provider>
      );
    case 'OrganizationSwitcher':
      return (
        <OrganizationSwitcherContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </OrganizationSwitcherContext.Provider>
      );
    case 'OrganizationList':
      return (
        <OrganizationListContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </OrganizationListContext.Provider>
      );
    case 'OrganizationProfile':
      return (
        <OrganizationProfileContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </OrganizationProfileContext.Provider>
      );
    case 'CreateOrganization':
      return (
        <CreateOrganizationContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </CreateOrganizationContext.Provider>
      );
    case 'GoogleOneTap':
      return (
        <GoogleOneTapContext.Provider value={{ componentName, ...componentProps }}>
          {wrappedChildren}
        </GoogleOneTapContext.Provider>
      );
    case 'Waitlist':
      return (
        <WaitlistContext.Provider value={{ componentName, ...(componentProps as WaitlistProps) }}>
          {wrappedChildren}
        </WaitlistContext.Provider>
      );
    case 'PricingTable':
      return (
        <SubscriberTypeContext.Provider
          value={
            // Backward compatibility: support legacy `forOrganizations: true`
            (componentProps as any).forOrganizations
              ? 'organization'
              : (componentProps as PricingTableProps).for || 'user'
          }
        >
          <PricingTableContext.Provider value={{ componentName, ...(componentProps as PricingTableProps) }}>
            {wrappedChildren}
          </PricingTableContext.Provider>
        </SubscriberTypeContext.Provider>
      );
    case 'APIKeys':
      return (
        <APIKeysContext.Provider value={{ componentName, ...(componentProps as APIKeysProps) }}>
          {wrappedChildren}
        </APIKeysContext.Provider>
      );
    case 'OAuthConsent':
      return (
        <OAuthConsentContext.Provider value={{ componentName, ...(componentProps as __internal_OAuthConsentProps) }}>
          {wrappedChildren}
        </OAuthConsentContext.Provider>
      );
    case 'TaskChooseOrganization':
      return (
        <TaskChooseOrganizationContext.Provider
          value={{ componentName: 'TaskChooseOrganization', ...(componentProps as TaskChooseOrganizationProps) }}
        >
          {wrappedChildren}
        </TaskChooseOrganizationContext.Provider>
      );
    default:
      throw new Error(`Unknown component context: ${componentName}`);
  }
}

export * from './components';
