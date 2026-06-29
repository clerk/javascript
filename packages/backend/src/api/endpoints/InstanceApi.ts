import { joinPaths } from '../../util/path';
import type { Instance } from '../resources/Instance';
import type { InstanceRestrictions } from '../resources/InstanceRestrictions';
import type { OrganizationSettings } from '../resources/OrganizationSettings';
import { AbstractAPI } from './AbstractApi';

const basePath = '/instance';

/** @generateWithEmptyComment */
export type UpdateParams = {
  /** Toggles [test mode](https://clerk.com/docs/guides/development/testing/test-emails-and-phones#set-up-test-mode) for this instance, allowing the use of test email addresses and phone numbers. Defaults to `true` for development instances. */
  testMode?: boolean | null | undefined;
  /** Whether the instance should be using the Have I Been Pwned (HIBP) service to check passwords for breaches. */
  hibp?: boolean | null | undefined;
  /** Whether the instance should send emails from "verifications@clerk.dev" instead of your domain. This can be helpful if you do not have a high domain reputation. */
  enhancedEmailDeliverability?: boolean | null | undefined;
  /** The support email for the instance. */
  supportEmail?: string | null | undefined;
  /** The npm version for `@clerk/clerk-js`. */
  clerkJsVersion?: string | null | undefined;
  /** The development origin for the instance. */
  developmentOrigin?: string | null | undefined;
  /** For browser-like stacks such as browser extensions, Electron, or Capacitor.js, the instance allowed origins need to be updated with the request origin value. For Chrome extensions popup, background, or service worker pages the origin is `chrome-extension://extension_uiid`. For Electron apps the default origin is `http://localhost:3000`. For Capacitor.js, the origin is `capacitor://localhost`. */
  allowedOrigins?: Array<string> | undefined;
  /** Whether the instance should use URL-based session syncing in development mode (i.e. without third-party cookies). */
  urlBasedSessionSyncing?: boolean | null | undefined;
  /** Overrides the sign-in strategy that is preferred when a password is required. The value is only consulted when a password is required, and is dormant otherwise. Pass an empty string to clear the override. Passing `null` or `undefined` leaves the current value unchanged. */
  preferredSignInStrategyWhenPasswordRequired?: 'password' | 'otp' | '' | null | undefined;
};

/** @generateWithEmptyComment */
export type UpdateRestrictionsParams = {
  /** Whether the instance should have [**Allowlist**](https://clerk.com/docs/guides/secure/restricting-access#allowlist) enabled. */
  allowlist?: boolean | null | undefined;
  /** Whether the instance should have [**Blocklist**](https://clerk.com/docs/guides/secure/restricting-access#blocklist) enabled. */
  blocklist?: boolean | null | undefined;
  /** Whether the instance should have [**Block email subaddresses**](https://clerk.com/docs/guides/secure/restricting-access#block-email-subaddresses) enabled. */
  blockEmailSubaddresses?: boolean | null | undefined;
  /** Whether the instance should have [**Block sign-ups that use disposable email domains**](https://clerk.com/docs/guides/secure/restricting-access#block-sign-ups-that-use-disposable-email-addresses) enabled. */
  blockDisposableEmailDomains?: boolean | null | undefined;
  /** Whether the instance should [ignore dots for Gmail addresses](https://clerk.com/docs/guides/secure/restricting-access#block-email-subaddresses). */
  ignoreDotsForGmailAddresses?: boolean | null | undefined;
};

/** @generateWithEmptyComment */
export type UpdateOrganizationSettingsParams = {
  /** Whether the instance should enable [Organizations](https://clerk.com/docs/guides/organizations/overview). */
  enabled?: boolean | null | undefined;
  /** The maximum number of [memberships allowed](https://clerk.com/docs/guides/organizations/configure#membership-limits) per Organization. */
  maxAllowedMemberships?: number | null | undefined;
  /** Whether [Organization admins](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions#default-roles) are allowed to delete Organizations. */
  adminDeleteEnabled?: boolean | null | undefined;
  /** Whether [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) are enabled for Organizations. */
  domainsEnabled?: boolean | null | undefined;
  /** Specifies which [enrollment modes](https://clerk.com/docs/guides/organizations/add-members/verified-domains#enable-verified-domains) to enable for your Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Supported modes are `'automatic_invitation'` & `'automatic_suggestion'`. */
  domainsEnrollmentModes?: Array<string> | undefined;
  /** Specifies what the default Organization [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) is for an Organization creator. */
  creatorRoleId?: string | null | undefined;
  /** Specifies what the default Organization [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) is for the Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains). */
  domainsDefaultRoleId?: string | null | undefined;
};

/** @generateWithEmptyComment */
export class InstanceAPI extends AbstractAPI {
  /**
   * Gets the current [`Instance`](https://clerk.com/docs/reference/backend/types/backend-instance).
   */
  public async get() {
    return this.request<Instance>({
      method: 'GET',
      path: basePath,
    });
  }

  /**
   * Updates the current instance.
   */
  public async update(params: UpdateParams) {
    return this.request<void>({
      method: 'PATCH',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Updates the [restriction](https://clerk.com/docs/guides/secure/restricting-access) settings for the current instance.
   * @returns The updated [`InstanceRestrictions`](https://clerk.com/docs/reference/backend/types/backend-instance-restrictions).
   */
  public async updateRestrictions(params: UpdateRestrictionsParams) {
    return this.request<InstanceRestrictions>({
      method: 'PATCH',
      path: joinPaths(basePath, 'restrictions'),
      bodyParams: params,
    });
  }

  /**
   * Gets the [`OrganizationSettings`](https://clerk.com/docs/reference/backend/types/backend-organization-settings) for the current instance.
   */
  public async getOrganizationSettings() {
    return this.request<OrganizationSettings>({
      method: 'GET',
      path: joinPaths(basePath, 'organization_settings'),
    });
  }

  /**
   * Updates the [Organization-related settings](https://clerk.com/docs/guides/organizations/configure) for the current instance.
   * @returns The updated [`OrganizationSettings`](https://clerk.com/docs/reference/backend/types/backend-organization-settings).
   */
  public async updateOrganizationSettings(params: UpdateOrganizationSettingsParams) {
    return this.request<OrganizationSettings>({
      method: 'PATCH',
      path: joinPaths(basePath, 'organization_settings'),
      bodyParams: params,
    });
  }
}
