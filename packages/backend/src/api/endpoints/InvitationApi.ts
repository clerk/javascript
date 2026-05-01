import type { ClerkPaginationRequest } from '@clerk/shared/types';

import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { InvitationStatus } from '../resources/Enums';
import type { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';
import type { WithSign } from './util-types';

const basePath = '/invitations';

type TemplateSlug = 'invitation' | 'waitlist_invitation';

type CreateParams = {
  emailAddress: string;
  expiresInDays?: number;
  ignoreExisting?: boolean;
  notify?: boolean;
  publicMetadata?: UserPublicMetadata;
  redirectUrl?: string;
  templateSlug?: TemplateSlug;
};

type CreateBulkParams = Array<CreateParams>;

type GetInvitationListParams = ClerkPaginationRequest<{
  /**
   * Orders the returned invitations by a specific field and direction.
   *
   * Use a leading '-' for descending order, or no sign/'+' for ascending.
   *
   * Supported fields:
   * - 'created_at' — when the invitation was created
   * - 'email_address' — recipient email address
   * - 'expires_at' — when the invitation expires
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

export class InvitationAPI extends AbstractAPI {
  public async getInvitationList(params: GetInvitationListParams = {}) {
    return this.request<PaginatedResourceResponse<Invitation[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  public async createInvitation(params: CreateParams) {
    return this.request<Invitation>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async createInvitationBulk(params: CreateBulkParams) {
    return this.request<Invitation[]>({
      method: 'POST',
      path: joinPaths(basePath, 'bulk'),
      bodyParams: params,
    });
  }

  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this.request<Invitation>({
      method: 'POST',
      path: joinPaths(basePath, invitationId, 'revoke'),
    });
  }
}
