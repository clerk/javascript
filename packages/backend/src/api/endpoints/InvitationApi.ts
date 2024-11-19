import type { ClerkPaginationRequest } from '@clerk/types';

import { joinPaths } from '../../util/path';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Invitation } from '../resources/Invitation';
import { AbstractAPI } from './AbstractApi';

const basePath = '/invitations';

type CreateParams = {
  emailAddress: string;
  redirectUrl?: string;
  publicMetadata?: UserPublicMetadata;
  notify?: boolean;
  ignoreExisting?: boolean;
};

type GetInvitationListParams = ClerkPaginationRequest<{
  /**
   * Filters invitations based on their status(accepted, pending, revoked).
   *
   * @example
   * Get all revoked invitations
   * ```ts
   * import { createClerkClient } from '@clerk/backend';
   * const clerkClient = createClerkClient(...)
   * await clerkClient.invitations.getInvitationList({ status: 'revoked })
   * ```
   *
   */
  status?: 'accepted' | 'pending' | 'revoked';
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

  public async revokeInvitation(invitationId: string) {
    this.requireId(invitationId);
    return this.request<Invitation>({
      method: 'POST',
      path: joinPaths(basePath, invitationId, 'revoke'),
    });
  }
}
