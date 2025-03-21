/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { organizationInvitationsBulkCreate } from '../funcs/organizationInvitationsBulkCreate.js';
import { organizationInvitationsCreate } from '../funcs/organizationInvitationsCreate.js';
import { organizationInvitationsGet } from '../funcs/organizationInvitationsGet.js';
import { organizationInvitationsGetAll } from '../funcs/organizationInvitationsGetAll.js';
import { organizationInvitationsList } from '../funcs/organizationInvitationsList.js';
import { organizationInvitationsListPending } from '../funcs/organizationInvitationsListPending.js';
import { organizationInvitationsRevoke } from '../funcs/organizationInvitationsRevoke.js';
import { ClientSDK, RequestOptions } from '../lib/sdks.js';
import * as components from '../models/components/index.js';
import * as operations from '../models/operations/index.js';
import { unwrapAsync } from '../types/fp.js';

export class OrganizationInvitations extends ClientSDK {
  /**
   * Get a list of organization invitations for the current instance
   *
   * @remarks
   * This request returns the list of organization invitations for the instance.
   * Results can be paginated using the optional `limit` and `offset` query parameters.
   * You can filter them by providing the 'status' query parameter, that accepts multiple values.
   * You can change the order by providing the 'order' query parameter, that accepts multiple values.
   * You can filter by the invited user email address providing the `query` query parameter.
   * The organization invitations are ordered by descending creation date by default.
   */
  async getAll(
    request: operations.ListInstanceOrganizationInvitationsRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitationsWithPublicOrganizationData> {
    return unwrapAsync(organizationInvitationsGetAll(this, request, options));
  }

  /**
   * Create and send an organization invitation
   *
   * @remarks
   * Creates a new organization invitation and sends an email to the provided `email_address` with a link to accept the invitation and join the organization.
   * You can specify the `role` for the invited organization member.
   *
   * New organization invitations get a "pending" status until they are revoked by an organization administrator or accepted by the invitee.
   *
   * The request body supports passing an optional `redirect_url` parameter.
   * When the invited user clicks the link to accept the invitation, they will be redirected to the URL provided.
   * Use this parameter to implement a custom invitation acceptance flow.
   *
   * You can specify the ID of the user that will send the invitation with the `inviter_user_id` parameter.
   * That user must be a member with administrator privileges in the organization.
   * Only "admin" members can create organization invitations.
   *
   * You can optionally provide public and private metadata for the organization invitation.
   * The public metadata are visible by both the Frontend and the Backend whereas the private ones only by the Backend.
   * When the organization invitation is accepted, the metadata will be transferred to the newly created organization membership.
   */
  async create(
    request: operations.CreateOrganizationInvitationRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitation> {
    return unwrapAsync(organizationInvitationsCreate(this, request, options));
  }

  /**
   * Get a list of organization invitations
   *
   * @remarks
   * This request returns the list of organization invitations.
   * Results can be paginated using the optional `limit` and `offset` query parameters.
   * You can filter them by providing the 'status' query parameter, that accepts multiple values.
   * The organization invitations are ordered by descending creation date.
   * Most recent invitations will be returned first.
   * Any invitations created as a result of an Organization Domain are not included in the results.
   */
  async list(
    request: operations.ListOrganizationInvitationsRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitations> {
    return unwrapAsync(organizationInvitationsList(this, request, options));
  }

  /**
   * Bulk create and send organization invitations
   *
   * @remarks
   * Creates new organization invitations in bulk and sends out emails to the provided email addresses with a link to accept the invitation and join the organization.
   * You can specify a different `role` for each invited organization member.
   * New organization invitations get a "pending" status until they are revoked by an organization administrator or accepted by the invitee.
   * The request body supports passing an optional `redirect_url` parameter for each invitation.
   * When the invited user clicks the link to accept the invitation, they will be redirected to the provided URL.
   * Use this parameter to implement a custom invitation acceptance flow.
   * You can specify the ID of the user that will send the invitation with the `inviter_user_id` parameter. Each invitation
   * can have a different inviter user.
   * Inviter users must be members with administrator privileges in the organization.
   * Only "admin" members can create organization invitations.
   * You can optionally provide public and private metadata for each organization invitation. The public metadata are visible
   * by both the Frontend and the Backend, whereas the private metadata are only visible by the Backend.
   * When the organization invitation is accepted, the metadata will be transferred to the newly created organization membership.
   */
  async bulkCreate(
    request: operations.CreateOrganizationInvitationBulkRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitations> {
    return unwrapAsync(organizationInvitationsBulkCreate(this, request, options));
  }

  /**
   * Get a list of pending organization invitations
   *
   * @remarks
   * This request returns the list of organization invitations with "pending" status.
   * These are the organization invitations that can still be used to join the organization, but have not been accepted by the invited user yet.
   * Results can be paginated using the optional `limit` and `offset` query parameters.
   * The organization invitations are ordered by descending creation date.
   * Most recent invitations will be returned first.
   * Any invitations created as a result of an Organization Domain are not included in the results.
   *
   * @deprecated method: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  async listPending(
    request: operations.ListPendingOrganizationInvitationsRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitations> {
    return unwrapAsync(organizationInvitationsListPending(this, request, options));
  }

  /**
   * Retrieve an organization invitation by ID
   *
   * @remarks
   * Use this request to get an existing organization invitation by ID.
   */
  async get(
    request: operations.GetOrganizationInvitationRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitation> {
    return unwrapAsync(organizationInvitationsGet(this, request, options));
  }

  /**
   * Revoke a pending organization invitation
   *
   * @remarks
   * Use this request to revoke a previously issued organization invitation.
   * Revoking an organization invitation makes it invalid; the invited user will no longer be able to join the organization with the revoked invitation.
   * Only organization invitations with "pending" status can be revoked.
   * The request accepts the `requesting_user_id` parameter to specify the user which revokes the invitation.
   * Only users with "admin" role can revoke invitations.
   */
  async revoke(
    request: operations.RevokeOrganizationInvitationRequest,
    options?: RequestOptions,
  ): Promise<components.OrganizationInvitation> {
    return unwrapAsync(organizationInvitationsRevoke(this, request, options));
  }
}
