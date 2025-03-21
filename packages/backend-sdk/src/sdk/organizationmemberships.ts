/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationMembershipsCreate } from '../funcs/organizationMembershipsCreate.js';
import { organizationMembershipsDelete } from '../funcs/organizationMembershipsDelete.js';
import { organizationMembershipsList } from '../funcs/organizationMembershipsList.js';
import { organizationMembershipsUpdate } from '../funcs/organizationMembershipsUpdate.js';
import { organizationMembershipsUpdateMetadata } from '../funcs/organizationMembershipsUpdateMetadata.js';
import { ClientSDK, RequestOptions } from '../lib/sdks.js';
import * as components from '../models/components/index.js';
import * as operations from '../models/operations/index.js';
import { unwrapAsync } from '../types/fp.js';

export class OrganizationMemberships extends ClientSDK {
  /**
   * Create a new organization membership
   *
   * @remarks
   * Adds a user as a member to the given organization.
   * Only users in the same instance as the organization can be added as members.
   *
   * This organization will be the user's [active organization] (https://clerk.com/docs/organizations/overview#active-organization)
   * the next time they create a session, presuming they don't explicitly set a
   * different organization as active before then.
   */
  async create(
    request: operations.CreateOrganizationMembershipRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationMembership> {
    return unwrapAsync(organizationMembershipsCreate(this, request, options));
  }

  /**
   * Get a list of all members of an organization
   *
   * @remarks
   * Retrieves all user memberships for the given organization
   */
  async list(
    request: operations.ListOrganizationMembershipsRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationMemberships> {
    return unwrapAsync(organizationMembershipsList(this, request, options));
  }

  /**
   * Update an organization membership
   *
   * @remarks
   * Updates the properties of an existing organization membership
   */
  async update(
    request: operations.UpdateOrganizationMembershipRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationMembership> {
    return unwrapAsync(organizationMembershipsUpdate(this, request, options));
  }

  /**
   * Remove a member from an organization
   *
   * @remarks
   * Removes the given membership from the organization
   */
  async delete(
    request: operations.DeleteOrganizationMembershipRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationMembership> {
    return unwrapAsync(organizationMembershipsDelete(this, request, options));
  }

  /**
   * Merge and update organization membership metadata
   *
   * @remarks
   * Update an organization membership's metadata attributes by merging existing values with the provided parameters.
   * Metadata values will be updated via a deep merge. Deep means that any nested JSON objects will be merged as well.
   * You can remove metadata keys at any level by setting their value to `null`.
   */
  async updateMetadata(
    request: operations.UpdateOrganizationMembershipMetadataRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationMembership> {
    return unwrapAsync(organizationMembershipsUpdateMetadata(this, request, options));
  }
}
