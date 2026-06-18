import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { InvitationStatus } from '../resources/Enums';
import type { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/invitations';

/** @inline */
export type TemplateSlug = 'invitation' | 'waitlist_invitation';

/** @generateWithEmptyComment */
export type CreateParams = {
  /** The email address of the user to invite. */
  emailAddress: string;
  /** The number of days until the invitation expires. Defaults to `30`. */
  expiresInDays?: number;
  /** Whether an invitation should be created if there is already an existing invitation for this email address, or if the email address already exists in the application. Defaults to `false`. */
  ignoreExisting?: boolean;
  /** Whether an email invitation should be sent to the given email address. Defaults to `true`. */
  notify?: boolean;
  /** Metadata that can be read and set only from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}. Once the user accepts the invitation and signs up, these metadata will end up in the user's public metadata ([`User.publicMetadata`](https://clerk.com/docs/reference/backend/types/backend-user)). */
  publicMetadata?: UserPublicMetadata;
  /** The full URL or path where the user will land after accepting the invitation. See the [custom flow guide for handling application invitations](https://clerk.com/docs/guides/development/custom-flows/authentication/application-invitations). */
  redirectUrl?: string;
  /** The template slug to use for the invitation. Defaults to `invitation`. */
  templateSlug?: TemplateSlug;
};

/** @generateWithEmptyComment */
export type CreateBulkParams = Array<CreateParams>;

/** @generateWithEmptyComment */
export type GetInvitationListParams = ClerkPaginationRequest<{
  /**
   * Filters the invitations in a particular order. Prefix a value with `+` to sort in ascending order, or `-` to sort in descending order. Defaults to `-created_at`.
   *
   * @example
   * ```ts
   * // Newest first
   * await clerkClient.invitations.getInvitationList({ orderBy: '-created_at' });
   *
   * // Alphabetical by email
   * await clerkClient.invitations.getInvitationList({ orderBy: 'email_address' });
   * ```
   */
  orderBy?: WithSign<'created_at' | 'email_address' | 'expires_at'>;
  /**
   * Filters invitations based on their status.
   *
   * @example
   * Get all revoked invitations
   * ```ts
   * import { createClerkClient } from '@clerk/backend';
   * const clerkClient = createClerkClient(...)
   * await clerkClient.invitations.getInvitationList({ status: 'revoked' })
   * ```
   */
  status?: InvitationStatus;
  /**
   * Filters invitations based on `email_address` or `id`.
   *
   * @example
   * Get all invitations for a specific email address
   * ```ts
   * import { createClerkClient } from '@clerk/backend';
   * const clerkClient = createClerkClient(...)
   * await clerkClient.invitations.getInvitationList({ query: 'user@example.com' })
   * ```
   */
  query?: string;
}>;

/** @generateWithEmptyComment */
export class InvitationAPI extends AbstractAPI {
  /**
   * Gets a list of non-revoked invitations for the instance, sorted by descending creation date.
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation) objects and a `totalCount` property containing the total number of invitations.
   */
  public async getInvitationList(params: GetInvitationListParams = {}) {
    return this.request<PaginatedResourceResponse<Invitation[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  /**
   * Creates a new invitation for the given email address, and sends the invitation email.
   *
   * If an email address has already been invited or already exists in your application, trying to create a new invitation will return an error. To bypass this error and create a new invitation anyways, set `ignoreExisting` to `true`.
   * @returns The newly created [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation).
   */
  public async createInvitation(params: CreateParams) {
    return this.request<Invitation>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Creates multiple invitations for the given email addresses, and sends the invitation emails.
   *
   * If an email address has already been invited or already exists in your application, trying to create a new invitation will return an error. To bypass this error and create a new invitation anyways, set `ignoreExisting` to `true`.
   * @returns An array of each created [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation) object.
   */
  public async createInvitationBulk(params: CreateBulkParams) {
    return this.request<Invitation[]>({
      method: 'POST',
      path: joinPaths(basePath, 'bulk'),
      bodyParams: params,
    });
  }

  /**
   * Revokes the given invitation.
   *
   * Revoking an an invitation makes the invitation email link unusable. However, it doesn't prevent the user from signing up if they follow the sign up flow.
   *
   * Only active (i.e. non-revoked) invitations can be revoked.
   * @param invitationId - The ID of the invitation to revoke.
   * @returns The revoked [`Invitation`](https://clerk.com/docs/reference/backend/types/backend-invitation).
   */
  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this.request<Invitation>({
      method: 'POST',
      path: joinPaths(basePath, invitationId, 'revoke'),
    });
  }
}
