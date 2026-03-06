import type { ClerkPaginationRequest } from '@clerk/shared/types';
import { joinPaths } from 'src/util/path';

import type { DeletedObject, JwtTemplate } from '../resources';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import { AbstractAPI } from './AbstractApi';

const basePath = '/jwt_templates';

type Claims = object;

type CreateJWTTemplateParams = {
  /**
   * JWT template name
   */
  name: string;
  /**
   * JWT template claims in JSON format
   */
  claims: Claims;
  /**
   * JWT token lifetime
   */
  lifetime?: number | null | undefined;
  /**
   * JWT token allowed clock skew
   */
  allowedClockSkew?: number | null | undefined;
  /**
   * Whether a custom signing key/algorithm is also provided for this template
   */
  customSigningKey?: boolean | undefined;
  /**
   * The custom signing algorithm to use when minting JWTs. Required if `custom_signing_key` is `true`.
   */
  signingAlgorithm?: string | null | undefined;
  /**
   * The custom signing private key to use when minting JWTs. Required if `custom_signing_key` is `true`.
   */
  signingKey?: string | null | undefined;
};

type UpdateJWTTemplateParams = CreateJWTTemplateParams & {
  /**
   * JWT template ID
   */
  templateId: string;
};

export class JwtTemplatesApi extends AbstractAPI {
  public async list(params: ClerkPaginationRequest = {}) {
    return this.request<PaginatedResourceResponse<JwtTemplate[]>>({
      method: 'GET',
      path: basePath,
      queryParams: { ...params, paginated: true },
    });
  }

  public async get(templateId: string) {
    this.requireId(templateId);

    return this.request<JwtTemplate>({
      method: 'GET',
      path: joinPaths(basePath, templateId),
    });
  }

  public async create(params: CreateJWTTemplateParams) {
    return this.request<JwtTemplate>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async update(params: UpdateJWTTemplateParams) {
    const { templateId, ...bodyParams } = params;

    this.requireId(templateId);
    return this.request<JwtTemplate>({
      method: 'PATCH',
      path: joinPaths(basePath, templateId),
      bodyParams,
    });
  }

  public async delete(templateId: string) {
    this.requireId(templateId);

    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, templateId),
    });
  }
}
