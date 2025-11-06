import type {
  ActClaim,
  Clerk,
  ClerkOptions,
  ClientResource,
  CustomMenuItem,
  CustomPage,
  JwtPayload,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  OrganizationResource,
  SessionStatusClaim,
  SignedInSessionResource,
  UserResource,
  Without,
} from '@clerk/shared/types';
import type { Component, ComputedRef, ShallowRef, Slot, VNode } from 'vue';

export interface VueClerkInjectionKeyType {
  clerk: ShallowRef<Clerk | null>;
  authCtx: ComputedRef<{
    userId: string | null | undefined;
    sessionId: string | null | undefined;
    actor: ActClaim | null | undefined;
    sessionStatus: SessionStatusClaim | null | undefined;
    sessionClaims: JwtPayload | null | undefined;
    orgId: string | null | undefined;
    orgRole: OrganizationCustomRoleKey | null | undefined;
    orgSlug: string | null | undefined;
    orgPermissions: OrganizationCustomPermissionKey[] | null | undefined;
    factorVerificationAge: [number, number] | null;
  }>;
  clientCtx: ComputedRef<ClientResource | null | undefined>;
  sessionCtx: ComputedRef<SignedInSessionResource | null | undefined>;
  userCtx: ComputedRef<UserResource | null | undefined>;
  organizationCtx: ComputedRef<OrganizationResource | null | undefined>;
  treatPendingAsSignedOut?: boolean;
}

// Copied from `@clerk/clerk-react`
export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: Without<ClerkOptions, 'isSatellite'>) => Promise<void>;
  updateClient: (client: ClientResource) => void;
}

// Copied from `@clerk/clerk-react`
export interface BrowserClerk extends HeadlessBrowserClerk {
  onComponentsReady: Promise<void>;
  components: any;
}

export interface CustomPortalsRendererProps {
  customPagesPortals?: VNode[];
  customMenuItemsPortals?: VNode[];
}

export type CustomItemOrPageWithoutHandler<T> = Without<T, 'mount' | 'unmount' | 'mountIcon' | 'unmountIcon'>;

export type AddCustomMenuItemParams = {
  props: CustomItemOrPageWithoutHandler<CustomMenuItem>;
  slots: {
    labelIcon?: Slot;
  };
  component: Component;
};

export type AddCustomPagesParams = {
  props: CustomItemOrPageWithoutHandler<CustomPage>;
  slots: {
    default?: Slot;
    labelIcon?: Slot;
  };
  component: Component;
};

type PageProps<T extends string> =
  | {
      label: string;
      url: string;
    }
  | {
      label: T;
      url?: never;
    };

export type UserProfilePageProps = PageProps<'account' | 'security'>;

export type UserProfileLinkProps = {
  url: string;
  label: string;
};

export type OrganizationProfilePageProps = PageProps<'general' | 'members'>;

export type OrganizationLinkProps = {
  url: string;
  label: string;
};

type ButtonActionProps<T extends string> =
  | {
      label: string;
      onClick: () => void;
      open?: never;
    }
  | {
      label: T;
      onClick?: never;
      open?: never;
    }
  | {
      label: string;
      onClick?: never;
      open: string;
    };

export type UserButtonActionProps = ButtonActionProps<'manageAccount' | 'signOut'>;

export type UserButtonLinkProps = {
  href: string;
  label: string;
};

declare global {
  interface Window {
    Clerk: BrowserClerk;
  }
}
