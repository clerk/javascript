import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

/**
 * The type of advisory returned when computing the defaults for creating an Organization.
 *
 * @inline
 */
export type OrganizationCreationAdvisoryType = 'organization_already_exists';

/**
 * The severity of an advisory returned when computing the defaults for creating an Organization.
 *
 * @inline
 */
export type OrganizationCreationAdvisorySeverity = 'warning';

/**
 * The JSON representation of the {@link OrganizationCreationDefaultsResource} object, as returned by the
 * [Frontend API](https://clerk.com/docs/reference/frontend-api).
 */
export interface OrganizationCreationDefaultsJSON extends ClerkResourceJSON {
  /**
   * An optional advisory surfacing a potential issue with the suggested defaults, or `null` if there is none.
   */
  advisory: {
    /**
     * The code identifying the advisory.
     */
    code: OrganizationCreationAdvisoryType;
    /**
     * The severity of the advisory.
     */
    severity: OrganizationCreationAdvisorySeverity;
    /**
     * Additional metadata providing context about the advisory.
     */
    meta: Record<string, string>;
  } | null;
  /**
   * The suggested default values to pre-fill the Organization creation form with.
   */
  form: {
    /**
     * The suggested Organization name.
     */
    name: string;
    /**
     * The suggested URL-friendly identifier for the Organization.
     */
    slug: string;
    /**
     * The suggested logo URL, or `null` if there is none.
     */
    logo: string | null;
    /**
     * The blur hash of the suggested logo, used to render a placeholder while the image loads, or `null` if there is none.
     */
    blur_hash: string | null;
  };
}

/**
 * The `OrganizationCreationDefaults` object holds the suggested default values to use when creating an Organization,
 * along with any advisory about those defaults.
 *
 * @interface
 */
export interface OrganizationCreationDefaultsResource extends ClerkResource {
  /**
   * An optional advisory surfacing a potential issue with the suggested defaults, or `null` if there is none.
   */
  advisory: {
    /**
     * The code identifying the advisory.
     */
    code: OrganizationCreationAdvisoryType;
    /**
     * The severity of the advisory.
     */
    severity: OrganizationCreationAdvisorySeverity;
    /**
     * Additional metadata providing context about the advisory.
     */
    meta: Record<string, string>;
  } | null;
  /**
   * The suggested default values to pre-fill the Organization creation form with.
   */
  form: {
    /**
     * The suggested Organization name.
     */
    name: string;
    /**
     * The suggested URL-friendly identifier for the Organization.
     */
    slug: string;
    /**
     * The suggested logo URL, or `null` if there is none.
     */
    logo: string | null;
    /**
     * The blur hash of the suggested logo, used to render a placeholder while the image loads, or `null` if there is none.
     */
    blurHash: string | null;
  };
}
